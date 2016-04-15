/**
 * RssController
 *
 * @description :: Server-side logic for managing rsses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    generate: function (req, res) {
        var start = req.param('start');
        var end = req.param('end');
        var user = req.param('user');

        if (isNaN(parseInt(start)) || start < 0) {
            start = 0;
        }

        if (end == null || end <= start) {
            end = -1;
        }

        res.json({success: true, msg: 'Running'});
        sails.log.info('Starting');
        GenreService.generate(user, start, end).then(function (err) {
            if (err) {
                sails.log.error(err.msg);

            }
            sails.log.info('done');
        }).catch(function (ex) {
            sails.log.error(ex.stack);
        });
    },
    del: function (req, res) {
        Suggestion.destroy({}).then(function (err) {
            res.json({err: err});
        });
    },
    generateSeedList: function (req, res) {
        GenreService.generateSeedList().then(function (list) {
            res.json({success: true, list: list});
        }).catch(function (ex) {
            sails.log.error(ex.stack);
            res.json({success: false, msg: ex.message});
        });
    },
    seedGenre: function (req, res) {
        GenreService.seedGenre().then(function (err) {
            res.json({success: true, err: err});
        }).catch(function (ex) {
            sails.log.error(ex.stack);
            res.json({success: false, msg: ex.message});
        });
    },
    generateSuggestionRankings: function (req, res) {
        res.json({success: true, msg: 'Running'});
        sails.log.info('Starting');
        GenreService.generateSuggestionRankings(req.cookies.user).then(function (err) {
            //   res.json({success: true, err: err});
            sails.log.info('done');
        }).catch(function (ex) {
            sails.log.error(ex.stack);
        });
    },
    buildUrls: function (req, res) {
        res.json({success: true, msg: 'Running'});
        sails.log.info('Starting buildUrls');
        GenreService.buildUrls(0, function (err) {
            sails.log.info('done buildUrls');
        }).catch(function (ex) {
            sails.log.error(ex.stack);
        });
    },
    buildManga: function (req, res) {
        res.json({success: true, msg: 'Running'});
        sails.log.info('Starting buildManga');
        Url.find({}).then(function (urls) {
            return GenreService.buildManga(urls, function (err) {
                sails.log.info('done buildManga');
            });
        }).catch(function (ex) {
            sails.log.error(ex.stack);
        });
    },
    generateRss: function (req, res) {
        var user = req.param('user');

        if (user == null) {
            user = req.cookies.user;
        }

        if (user == null) {
            res.json({success: false, msg: 'Could not dertermine user.'});
        }
        else {
            res.json({success: true, msg: 'Running'});
            sails.log.info('Starting generateRssSeed');
            return GenreService.generateRss(user).then(function (err) {
                sails.log.info('done generateRssSeed');
                if (err) {
                    sails.log.error(err);
                }
            }).catch(function (ex) {
                sails.log.error(ex.stack);
            });
        }
    },
    test: function (req, res) {
        var urls = [{
            name: '1'
        }, {
            name: '2'
        }, {
            name: '3'
        }, {
            name: '5'
        }];
        var count = 0;
        Url.find(urls).then(function (list) {
            count += list.length
            console.log(list)

            list.forEach(function (item) {
                var i = 0;
                while (i < urls.length) {
                    if (urls[i].name == item.name) {
                        urls.splice(i, 1);
                        break;
                    }
                    i++;
                }
            });

            Url.create(urls).then(function (created) {
                res.json(created)
            }).catch(function (err) {
                sails.log.err(err);
            });
        });
    }
};

