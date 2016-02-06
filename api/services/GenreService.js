/**
 * New node file
 */
var Promise = require('bluebird');

module.exports = {
    generateManga: function (user, mangaList, page, end, rss, cb) {
        var url = 'http://mangapark.me/search?orderby=latest&chapters=1&st-ss=1&page=' + page;
        var request = require('request');
        var cheerio = require('cheerio');
        var userAgent = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36';
        var me = this;

        sails.log.info('page :' + page + ' end: ' + end);
        Genre.find({}).then(function (gs) {
            var genres = {};

            gs.forEach(function (g) {
                genres[g.name.toLowerCase()] = g;
            });

            request({url: url, headers: {'User-agent': userAgent}}, function (error, response, body) {
                var chBody = cheerio(body);

                if (chBody.find('.no-match').length > 0 || page == end) {
                    cb(mangaList);
                }
                else {
                    var manga = {
                        name: '',
                        url: '',
                        summary: '',
                        genres: [],
                        year: -1,
                        status: 'Ongoing',
                        weighted: 0,
                        raw: 0
                    };
                    chBody.find('.manga-list').find('.item').each(function (index, child) {
                        manga = {
                            name: '',
                            url: '',
                            summary: '',
                            genres: [],
                            year: -1,
                            status: 'Ongoing',
                            weighted: 0,
                            raw: 0
                        };
                        cheerio(child).find('td').each(function (index1, child1) {
                            if (child1.children.length == 3) {
                                manga.url = 'http://mangapark.me' + child1.children[1].attribs.href;
                                manga.name = child1.children[1].attribs.title;
                            }
                            else {
                                cheerio(child1).find('.info').each(function (index2, child2) {
                                    if (child2.children.length == 7) {
                                        var info1 = child2.children[3].children;
                                        var info2 = child2.children[5].children;

                                        for (var i = 0; i < info1.length; i++) {
                                            if (info1[i].children != null && info1[i].children.length > 0 && info1[i].children[0].data == 'Status:') {
                                                manga.status = info1[i + 1].children[0].data;
                                                manga.year = parseInt(info1[i + 4].children[0].data);

                                                break;
                                            }
                                        }
                                        var found = false;
                                        for (var i = 0; i < info2.length; i++) {
                                            if (found && info2[i].children != null && info2[i].children.length > 0) {
                                                var g = info2[i].children[0].data.toLowerCase().trim();

                                                if (g != '[no chapters]') {
                                                    if (genres[g]) {
                                                        manga.raw += parseInt(genres[g].weight);
                                                    }

                                                    manga.genres.push(g)
                                                }
                                            }
                                            else if (info2[i].children != null && info2[i].children.length > 0 && info2[i].children[0].data == 'Genres:') {
                                                found = true;
                                            }
                                        }
                                    }
                                    else if (child2.children.length == 5) {
                                        var info1 = child2.children[1].children;
                                        var info2 = child2.children[3].children;

                                        for (var i = 0; i < info1.length; i++) {
                                            if (info1[i].children != null && info1[i].children.length > 0 && info1[i].children[0].data == 'Status:') {
                                                manga.status = info1[i + 1].children[0].data;
                                                manga.year = parseInt(info1[i + 4].children[0].data);
                                                break;
                                            }
                                        }
                                        var found = false;
                                        for (var i = 0; i < info2.length; i++) {
                                            if (found && info2[i].children != null && info2[i].children.length > 0) {
                                                var g = info2[i].children[0].data.toLowerCase().trim();

                                                if (g != '[no chapters]') {
                                                    if (genres[g]) {
                                                        manga.raw += parseInt(genres[g].weight);
                                                    }
                                                    manga.genres.push(g)
                                                }
                                            }
                                            else if (info2[i].children != null && info2[i].children.length > 0 && info2[i].children[0].data == 'Genres:') {
                                                found = true;
                                            }
                                        }
                                    }
                                });

                                manga.summary = cheerio(child1).find('.summary').html();

                                if (manga.summary && manga.summary != "") {
                                    manga.summary = manga.summary.replace(/\r/g, '').replace(/<br>/g, '').trim();
                                }
                                else if (manga.summary == "") {
                                    sails.log.info(cheerio(child1).find('.summary').html());
                                } else {
                                    manga.summary = '';
                                }
                            }
                        });

                        if (manga.length != 0) {
                            if (isNaN(manga.year)) {
                                manga.year = 0;
                            }
                            manga.weighted = (manga.genres.length > 0) ? manga.raw / manga.genres.length : 0;
                            if (rss.hasOwnProperty(manga.name)) {
                                manga.rss = true;
                                manga.rank = rss[manga.name];
                            }
                            manga.user = user;
                            manga.genrehash = manga.genres.join('');
                            mangaList.push(manga);
                        }
                    });

                    sails.log.info('Finished page :' + page);
                    if (mangaList.length > 100) {
                        Suggestion.create(mangaList).exec(function (err, created) {
                            if (err) {
                                sails.log.error('Error: ' + JSON.stringify(err));

                                for (var g = 0; g < mangaList.length; g++) {
                                    var a = mangaList[g];
                                    sails.log.error('name ' + typeof a.name);
                                    sails.log.error('url ' + typeof a.url);
                                    sails.log.error('year ' + a.year + ' ' + typeof a.year);
                                    sails.log.error('summary ' + typeof a.summary);
                                    sails.log.error('status ' + a.status + ' ' + typeof a.status);
                                    sails.log.error('genres ' + typeof a.genres);
                                }

                                cb({error: true, msg: err.stack});
                            }
                            else {
                                sails.log.info('Created :' + created.length);
                                me.generateManga(user, [], page + 1, end, rss, cb);
                            }
                        });
                    } else {
                        me.generateManga(user, mangaList, page + 1, end, rss, cb);
                    }
                }
            });
        });
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
    similarScore: function (obj1, obj2) {
        var score = 0;
        var genreScoreModifier = Math.abs(obj1.genres.length - obj2.genres.length);

        for (var i = 0; i < obj1.genres.length; i++) {
            if (obj2.genres.indexOf(obj1.genres[i])) {
                score++;
            }
        }
        score = score / obj1.genres.length;
        score = (genreScoreModifier != 0) ? score - (score * 1 / genreScoreModifier) : score;

        if (obj1.status == obj2.status) {
            score++;
        }
        if (obj1.year == obj2.year) {
            score++;
        }
        return score;
    },
    findMostSimilar: function (scope, arr, obj) {
        var sim = {};
        var keys = [];
        arr.forEach(function (item) {
            var score = scope.similarScore(item, obj);
            keys.push(score);
            if (sim.hasOwnProperty(score)) {
                sim[score].push(item.rank);
            } else {
                sim[score] = [];
                sim[score].push(item.rank);
            }
        });
        if (keys.length > 0) {
            return scope.median(sim[scope.max(keys)]);
        }
        else {
            return 0;
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
            return b - a
        });
        return sort[0];
    },
    generateSuggestionRankings: function (user) {
        sails.log.info('generateGenreSeed');
        var me = this;

        return new Promise(function (resolve, reject) {
            Suggestion.find({rss: true, user: user}, function (err, seed) {

                if (err) {
                    resolve({err: err});
                }
                else {
                    Suggestion.find({rss: false, user: user}, function (err, sugs) {

                        if (err) {
                            resolve({err: err});
                        }
                        else {
                            sugs.forEach(function (sug) {
                                sug.rank = me.findMostSimilar(me, seed, sug);
                                sug.save();
                            });
                        }
                    });
                }
            });
        });
    }
}

