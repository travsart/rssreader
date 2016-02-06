function similarScore(rss, sug) {
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
}

function findMostSimilar(rsses, sug) {
    var sim = {};
    var keys = [];
    rsses.forEach(function (rss) {
        var score = similarScore(rss, sug);
        keys.push(score);
        if (sim.hasOwnProperty(score)) {
            sim[score].push({name: rss.name, rank: rss.rank});
        } else {
            sim[score] = [];
            sim[score].push({name: rss.name, rank: rss.rank});
        }
    });
    if (keys.length != 0) {
        return sim[max(keys)];
    } else {
        return null;
    }
}
function median(arr) {
    var m = arr.sort(function (a, b) {
        return a - b
    });

    var middle = Math.floor((m.length - 1) / 2); // NB: operator precedence
    if (m.length % 2) {
        return m[middle];
    } else {
        return (m[middle] + m[middle + 1]) / 2.0;
    }
}
function max(arr) {
    var sort = arr.sort(function (a, b) {
        return b - a;
    });
    return sort[0];
}
function save(db, items, cb) {
    if (items.length == 0) {
        cb();
    }
    else {
        var sug = items.shift();

        db.collection('suggestion').update({_id: new require('mongodb').ObjectID(sug._id)}, {'$set': {rank: sug.rank}}, function (err, results) {
            save(db, items, cb);
        });
    }
}
function start() {
    var mongodb = require('mongodb').MongoClient;

    var url = 'mongodb://localhost:27017/rssreader';

    mongodb.connect(url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            db.collection('suggestion').find({rss: true}).toArray(function (err, rssSuggestion) {
                var rsses = [];

                rssSuggestion.forEach(function (rss) {
                    rsses.push({name: rss.name, genres: rss.genres, rank: rss.rank, genrehash: rss.genrehash});
                });
                db.collection('suggestion').find({rss: false}).toArray(function (err, s) {
                    var sugs = [];

                    s.forEach(function (sug) {
                        sug.similar = findMostSimilar(rsses, sug);
                        sugs.push(sug);
                    });
                    save(db, sugs, function () {
                        db.close();
                    });
                });
            });
        }
    });
}