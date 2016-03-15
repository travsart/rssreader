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
            return res.serverError({
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
                if(!results.success){
                    resRss.manga.err = results.err;
                }

                resRss.msg += results.msg;

                return RssService.checkSite('Anime', page, 0).then(function (results) {
                    resRss.success = resRss.success && results.success;
                    resRss.msg += ' ' + results.msg;

                    if(!results.success){
                        resRss.anime.err = results.err;
                    }

                    res.ok(resRss);
                }).catch(function (ex) {
                    sails.log.error(ex.stack);
                    res.serverError({success: false, msg: ex.message});
                });
            }).catch(function (ex) {
                sails.log.error(ex.stack);
                res.serverError({success: false, msg: ex.message});
            });
        } else {
            sails.log.debug('Checking type: ' + type);
            RssService.checkSite(type, page, 0).then(function (results) {
                res.ok(results);
            }).catch(function (ex) {
                sails.log.error(ex.stack);
                res.serverError({success: false, msg: ex.message});
            });
        }
    }
};

