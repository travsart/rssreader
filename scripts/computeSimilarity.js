var ComputeSimilarity = function () {
};

ComputeSimilarity.prototype = {
    removeStopWords: function (array) {
        retArr = [];

        array.forEach(function (item) {
            if (stopWords.indexOf(item) == -1) {
                retArr.push(item);
            }
        });

        return retArr;
    },
    generateCosine: function (s1, s2) {
        var similarity = require('compute-cosine-similarity');
        var sArr1 = removeStopWords(s1.trim().split(' '));
        var sArr2 = removeStopWords(s2.trim().split(' '));

        return similarity(sArr1, sArr2);
    },
    similarArrays: function (a1, a2) {
        var score = 0.0;
        var genreScoreModifier = 0;

        if (a1.length > a2.length) {
            genreScoreModifier = 1 - (a1.length / a2.length);
        }
        else if (a1.length < a2.length) {
            genreScoreModifier = 1 - (a2.length / a1.length);
        }

        for (var i = 0; i < a2.length; i++) {
            if (a1.indexOf(a2[i]) != -1) {
                score++;
            }
        }
        return score * genreScoreModifier;
    },
    compareYear: function (y1, y2) {
        switch (Math.abs(y1 - y2)) {
            case 0:
                return 1.0;
            case 1:
                return .9;
            case 2:
                return .8;
            case 3:
                return .65;
            case 4:
                return .5;
            case 5:
                return .3;
            case 6:
                return .2;
            case 7:
                return .1;
            case 8:
                return .05;
            case 9:
                return .03;
            case 10:
                return .01;
        }
        return 0;
    },
    generateWeight: function (m1, m2) {
        var score = this.compareYear(m1.year, m2.year);

        if (m1.authorshash == m2.authorshash) {
            score += 1;
        }
        else if (m1.authors.length != 0 && m2.authors.length != 0) {
            score += this.similarArrays(m1.authors, m2.authors);
        }
        if (m1.artistshash == m2.artistshash) {
            score += 1;
        }
        else if (m1.artists.length != 0 && m2.artists.length != 0) {
            score += this.similarArrays(m1.artists, m2.artists);
        }
        if (m1.genreshash == m2.genreshash) {
            score += 1;
        }
        else if (m1.genres.length != 0 && m2.genres.length != 0) {
            score += this.similarArrays(m1.genres, m2.genres);
        }

        if (m1.type == m2.type) {
            score++;
        }
    },
    setDb: function () {
        var me = this;

        return new Promise(function (resolve, reject) {
            var mongodb = require('mongodb').MongoClient;

            return mongodb.connect('mongodb://localhost:27017/rssreader', function (err, db) {
                if (err) {
                    console.log('Unable to connect to the mongoDB server. Error:', err);
                    reject(err);
                } else {
                    me.db = db;
                }
            });
        });
    },
    getManga: function () {
        var me = this;

        return new Promise(function (resolve, reject) {
            return me.db.collection('manga').find({}).toArray(function (err, mangas) {
                if (err) {
                    console.log('Unable to query the manga table. Error:', err);
                    reject(err);
                } else {
                    resolve(mangas);
                }
            });
        });
    },
    createSimilar: function (compare, mangas) {
        if (compare.length == 0) {
            return null;
        }
        else {
            var manga = compare.shift();
            var similar = [];
            var len = mangas.length;
            var me = this;

            for (var i = 0; i < len; i++) {
                similar.push({
                    name: mangas[i].name,
                    url: mangas[i].url,
                    weight: this.generateWeight(manga, mangas[i]),
                    cosine: this.generateCosine(manga.summary, mangas[i].summary)
                });
            }

            me.save(manga.id, similar).then(function () {
                me.createSimilar(compare, mangas);
                me.completed += 1;

                if (me.completed % 100 == 0) {
                    console.log('Completed : ' + me.completed);
                }
            }).catch(function () {
                console.log('Skipping ' + manga);
                me.createSimilar(compare, mangas);
            });
        }
    },
    start: function (compare, mangas) {
        console.log('Starting to generate similar manga');
        this.completed = 0;
        this.createSimilar(compare, mangas);
        console.log('Finished generating similar manga');
        this.close();
    },
    save: function (id, similar) {
        return new Promise(function (resolve, reject) {
            return me.db.collection('similar').insertOne({similar: similar, mangaId: id}, function (err) {
                if (err) {
                    console.log('Unable to save manga with id:' + id + '. Error:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },
    close: function () {
        me.db.close();
    }
};

modules.export = ComputeSimilarity;