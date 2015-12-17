/**
 * RssController
 *
 * @description :: Server-side logic for managing rsses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    runCheck: function (req, res) {
        var type = req.param('type');
        var page = req.param('page');

        if (page == null) {
            page = 0;
        }

        if (!(type == null || type == 'Manga' || type == 'Anime' || type == '')) {
            sails.log.error('Must send a valid type: Manga, Anime, or empty string to do both.');
            return res.send({
                success: false,
                message: 'Must send a valid type: Manga, Anime, or empty string to do both.'
            });
        }
        var updatedRss = [];
        if (type == null || type == '') {
            var resRss = {
                success: true,
                msg: ''
            };
            RssService.checkSite('Manga', page, 0).then(function (results) {
				sails.log.info(results);
                resRss.success = resRss.success && results.success;
                resRss.msg += results.msg;

                RssService.checkSite('Anime', page, 0).then(function (results) {
                    resRss.success = resRss.success && results.success;
                    resRss.msg += ' ' + results.msg;

                    res.json(resRss);
                }).catch(function (ex) {
                    sails.log.error(ex.stack);
                    res.json({success: false, msg: ex.message});
                });
            }).catch(function (ex) {
                sails.log.error(ex.stack);
                res.json({success: false, msg: ex.message});
            });
        } else {
            sails.log.debug('Checking type: ' + type);
            RssService.checkSite(type, page, 0).then(function (results) {
                res.json(results);
            }).catch(function (ex) {
                sails.log.error(ex.stack);
                res.json({success: false, msg: ex.message});
            });
        }
    },
    log: function (req, res) {
        var options = {};
        var level = req.param('level');
        var start = req.param('start');
        var end = req.param('end');
        var limit = req.param('limit');
        var moment = require('moment');

        options.level = (level == null) ? 'warn' : level;
        options.limit = (limit == null) ? -1 : limit;
        options.end = (end == null) ? moment() : end;
        options.start = (start == null) ? (moment(options.end).subtract(1, 'days')) : start;

        if (options.start.diff(options.end,'minutes') > 0) {
            options.start = moment(options.end).startOf('day');
        }

        RssService.getLog(options).then(function (results) {
            res.json(results);
        }).catch(function (ex) {
            sails.log.error(ex.stack);
            res.json({success: false, msg: ex.message});
        });
    }
};

