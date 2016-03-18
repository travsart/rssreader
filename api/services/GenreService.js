/**
 * New node file
 */
var Promise = require('bluebird');

module.exports = {
    hashCode: function (s) {
        return s.split("").reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
    },
    hashArray: function (arr) {
        var hash = '';
        arr.forEach(function (item) {
            hash += item;
        });

        return this.hashCode(hash);
    },
    parseManga: function (body, cb) {
        sails.log.debug('parseManga');
        var cheerio = require('cheerio');
        var me = this;
        var chBody = cheerio(body);
        var manga = {
            summary: '',
            genres: [],
            authors: [],
            artists: [],
            type: '',
            year: -1,
            status: 'Ongoing'
        };

        var lists = ['Author(s)', 'Artist(s)', 'Genre(s)'];
        var listsMapping = ['authors', 'artists', 'genres'];
        var text = ['Type', 'Release', 'Status'];
        var textMapping = ['type', 'year', 'status'];

        chBody.find('section.manga div.content').each(function (index, content) {
            cheerio(cheerio(content.children[3]).find('table .attr')).find('tr').each(function (index, row) {
                var th = row.children[1];

                if (th.children.length == 1) {
                    var key = th.children[0].data;
                    var td = row.children[3];
                    var listIndex = lists.indexOf(key);
                    var textIndex = text.indexOf(key);

                    if (listIndex > -1) {
                        cheerio(td).find('a').each(function (index, link) {
                            manga[listsMapping[listIndex]].push(link.attribs.title);
                        });
                    }
                    else if (textIndex > -1) {
                        manga[textMapping[textIndex]] = td.children[0].data.trim();
                    }
                }
            });
            manga.authorshash = me.hashArray(manga.authors);
            manga.artistshash = me.hashArray(manga.artists);
            manga.genreshash = me.hashArray(manga.genres);

            if (manga.type != '') {
                var index = manga.type.indexOf('-');

                if (index != -1) {
                    manga.type = manga.type.substring(0, index).trim();
                }
            }
            manga.summary = content.children[7].children[0].data;
            cb(null, manga);
        });

    },
    parseList: function (body, cb) {
        var cheerio = require('cheerio');
        var chBody = cheerio(body);

        if (chBody.find('.no-match').length > 0) {
            cb(null, null);
        }
        else {
            var urls = [];

            chBody.find('.manga-list').find('.item').each(function (index, child) {
                cheerio(child).find('td').each(function (index1, child1) {
                    if (child1.children.length == 3) {
                        urls.push({
                            url: 'http://mangapark.me' + child1.children[1].attribs.href,
                            name: child1.children[1].attribs.title
                        });
                    }
                });
            });

            cb(null, urls);
        }
    },
    requestUrl: function (url, parseFunc, cb, params) {
        var request = require('request');
        var userAgent = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36';

        request({url: url, headers: {'User-agent': userAgent}}, function (error, response, body) {
            if (error) {
                cb({error: error});
            }
            else {
                if (params) {
                    parseFunc(body, params, cb);
                }
                else {
                    parseFunc(body, cb);
                }
            }
        });
    },
    buildUrls: function (page, cb) {
        var me = this;
        var url = 'http://mangapark.me/search?orderby=add&chapters=1&st-ss=0&page=' + page;
        sails.log.info('buildUrls: ' + page);
        me.requestUrl(url, me.parseList, function (err, urls) {
                if (err) {
                    cb(err);
                }
                else {
                    if (urls) {
                        Url.create(urls).exec(function (err1, created) {
                            if (err1) {
                                cb(err1);
                            }
                            else {
                                me.buildUrls(page + 1, cb);
                            }
                        });
                    }
                    else {
                        cb();
                    }
                }
            }
        );
    },
    buildManga: function (urls, cb) {
        var me = this;

        if (urls.length > 0) {
            var url = urls.shift();

            sails.log.info('buildManga: ' + url.name);
            me.requestUrl(url.url, me.parseManga, function (err, manga) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        if (manga) {
                            manga.name = url.name;
                            manga.url = url.url;

                            Manga.create(manga).then(function (created) {
                                me.buildManga(urls, cb);
                            });
                        }
                        else {
                            cb();
                        }
                    }
                }
            );
        }
        else {
            cb();
        }
    },
    bulkUpdate: function (model, updates, field, cb) {

        var me = this;
        if (updates.length == 0) {
            cb();
        }
        else {
            var update = updates.shift();

            model.update({field: update[field]}, update).exec(function (err, updated) {

                if (err) {
                    cb(err);
                }
                else {
                    me.bulkUpdate(model, updates, field, cb);
                }
            });
        }
    },
    generate: function (user, page, end) {
        var me = this;
        sails.log.info('generate ' + page + ' ' + end);
        return new Promise(function (resolve, reject) {

            Rss.find({user: user, type: 'Manga'}, function (err, rs) {
                var rss = {};

                rs.forEach(function (r) {
                    rss[r.name] = r.rank;
                });
                me.generateManga(user, [], 0, end, rss, function (mangaList) {
                    if (mangaList.error) {
                        reject(mangaList);
                    }

                    sails.log.info('generate finished managList: ' + mangaList.length);
                    if (mangaList.length > 0) {
                        Suggestion.create(mangaList).exec(function (err) {
                            if (err) {
                                sails.log.error('Error: ' + JSON.stringify(err));
                                sails.log.error('Error: ' + err.stack)
                                reject({error: true, msg: err.stack});
                            }
                            sails.log.info('Created :' + mangaList.length);
                            resolve();
                        });
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    },
    buildList: function (rsses, list, cb) {
        var me = this;
        if (rsses.length == 0) {
            cb(list);
        }
        else {
            var rss = rsses.shift();

            Suggestion.find({name: rss.name}).then(function (g) {
                if (g.length == 1) {
                    list.push(g[0]);
                }
                me.buildList(rsses, list, cb);
            });

        }
    },
    generateSeedList: function () {
        var me = this;
        sails.log.info('generateSeedList');
        return new Promise(function (resolve, reject) {
            var list = [];

            Rss.find({type: 'Manga'}).then(function (rsses) {
                me.buildList(rsses, [], function (list) {
                    resolve(list);
                });
            });
        });
    },
    seedGenre: function () {
        var genres = ['Action', 'Fantasy', 'Adventure', 'Shounen', 'Seinen', 'Romance', 'Supernatural', 'Comedy', 'Drama', 'Martial arts',
            'Sci fi', 'Ecchi', 'Historical', 'Mature', 'Webtoon', 'Tragedy', 'Harem', 'School life', 'Psychological', 'Mystery', 'Horror',
            'Adult', 'Gender Bender', 'Mecha', 'Shoujo', 'Slice of life', 'Sports', '4 koma', 'Award winning', 'Cooking', 'Demons', 'Doujinshi',
            'Josei', 'Magic', 'Medical', 'Music', 'Shoujo ai', 'Shounen ai', 'Smut', 'Yaoi', 'Yuri', 'One shot'];

        var weights = {
            '4 koma': -4,
            'Action': 10,
            'Adult': 3,
            'Adventure': 9,
            'Award winning': 0,
            'Comedy': 6,
            'Cooking': 0,
            'Demons': 2,
            'Doujinshi': 0,
            'Drama': 7,
            'Ecchi': 0,
            'Fantasy': 9,
            'Gender Bender': -2,
            'Harem': 6,
            'Historical': 6,
            'Horror': 5,
            'Josei': 0,
            'Magic': 2,
            'Martial arts': 7,
            'Mature': 5,
            'Mecha': 2,
            'Medical': 0,
            'Music': 0,
            'Mystery': 4,
            'One shot': -10,
            'Psychological': 4,
            'Romance': 4,
            'School life': 3,
            'Sci fi': 6,
            'Seinen': 7,
            'Shoujo': 0,
            'Shoujo ai': 0,
            'Shounen': 8,
            'Shounen ai': -10,
            'Slice of life': 1,
            'Smut': 0,
            'Sports': 0,
            'Supernatural': 8,
            'Tragedy': 5,
            'Webtoon': 6,
            'Yaoi': 0,
            'Yuri': 0
        };
        var list = [];
        genres.forEach(function (genre) {
            list.push({name: genre, weight: weights[genre]});
        });

        sails.log.info('seedGenre1');
        return new Promise(function (resolve, reject) {
            Genre.create(list, function (err) {
                resolve(err);
            });
        });
    },
    similarScore: function (rss, sug) {
        if (rss.genrehash == sug.genrehash) {
            return 1;
        }

        var score = 0;
        var genreScoreModifier = 0;

        if (rss.genres.length > sug.genres.length) {
            genreScoreModifier = 1 - (rss.genres.length / sug.genres.length);
        }
        else if (rss.genres.length < sug.genres.length) {
            genreScoreModifier = 1 - (sug.genres.length / rss.genres.length);
        }

        for (var i = 0; i < sug.genres.length; i++) {
            if (rss.genres.indexOf(sug.genres[i]) != -1) {
                score++;
            }
        }
        return (genreScoreModifier != 0) ? (score * genreScoreModifier) / rss.genres.length : score / rss.genres.length;
    },

    findMostSimilar: function (rsses, sug) {
        var sim = {};
        var keys = [];
        var me = this;

        rsses.forEach(function (rss) {
            var score = me.similarScore(rss, sug);
            keys.push(score);
            if (sim.hasOwnProperty(score)) {
                sim[score].push({name: rss.name, rank: rss.rank});
            } else {
                sim[score] = [];
                sim[score].push({name: rss.name, rank: rss.rank});
            }
        });
        if (keys.length != 0) {
            return {
                similar: sim[me.max(keys)].sort(function (a, b) {
                    return b.rank - a.rank
                }), score: me.max(keys)
            };
        } else {
            return {similar: null, score: 0};
        }
    },
    median: function (arr) {
        var m = arr.sort(function (a, b) {
            return a - b
        });

        var middle = Math.floor((m.length - 1) / 2); // NB: operator precedence
        if (m.length % 2) {
            return m[middle];
        } else {
            return (m[middle] + m[middle + 1]) / 2.0;
        }
    },
    max: function (arr) {
        var sort = arr.sort(function (a, b) {
            return b - a;
        });
        return sort[0];
    },
    save: function (db, items, cb) {
        if (items.length == 0) {
            cb();
        }
        else {
            var sug = items.shift();
            var me = this;

            db.collection('suggestion').update({_id: new require('mongodb').ObjectID(sug._id)}, {
                '$set': {
                    similar: sug.similar,
                    score: sug.score,
                    highest: sug.similar[0].rank
                }
            }, function (err, results) {
                me.save(db, items, cb);
            });
        }
    },
    startSimilarMatching: function (cb) {
        var me = this;
        var mongodb = require('mongodb').MongoClient;

        var url = 'mongodb://localhost:27017/rssreader';

        mongodb.connect(url, function (err, db) {
            if (err) {
                sails.error('Unable to connect to the mongoDB server. Error:', err);
            } else {
                db.collection('suggestion').find({rss: true}).toArray(function (err, rssSuggestion) {
                    var rsses = [];

                    sails.log.info('startSimilarMatching: building rss');
                    rssSuggestion.forEach(function (rss) {
                        rsses.push({name: rss.name, genres: rss.genres, rank: rss.rank, genrehash: rss.genrehash});
                    });
                    db.collection('suggestion').find({rss: false}).toArray(function (err, s) {
                        var sugs = [];

                        sails.log.info('startSimilarMatching: building rankings');
                        s.forEach(function (sug) {
                            var retSim = me.findMostSimilar(rsses, sug);
                            sug.similar = retSim.similar;
                            sug.score = retSim.score;
                            sugs.push(sug);
                        });
                        sails.log.info('startSimilarMatching: saving');
                        me.save(db, sugs, function () {
                            db.close();
                            cb();
                        });
                    });
                });
            }
        });
    },
    generateSuggestionRankings: function (user) {
        sails.log.info('generateGenreSeed');
        var me = this;

        return new Promise(function (resolve, reject) {
            me.startSimilarMatching(resolve);
        });
    }
}

