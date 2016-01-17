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
        var calculate = req.param('calculate');

        if (isNaN(parseInt(start)) || start < 0) {
            start = 0;
        }

        if (end == null || end <= start) {
            end = -1;
        }

        sails.log.info('generate');
        GenreService.generate(start, end).then(function (err) {
            if (err) {
                sails.log.error(err.msg);
                res.json({success: false, msg: err.msg, err: err});
            }
            res.json({success: true, msg: ''});
        }).catch(function (ex) {
            sails.log.error(ex.stack);
            res.json({success: false, msg: ex.message});
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
        GenreService.generateSuggestionRankings(req.cookies.user).then(function (err) {
            res.json({success: true, err: err});
        }).catch(function (ex) {
            sails.log.error(ex.stack);
            res.json({success: false, msg: ex.message});
        });
    }
};

