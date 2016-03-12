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

        res.json({success:true,msg:'Running'});
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
        res.json({success:true,msg:'Running'});
        sails.log.info('Starting');
        GenreService.generateSuggestionRankings(req.cookies.user).then(function (err) {
         //   res.json({success: true, err: err});
            sails.log.info('done');
        }).catch(function (ex) {
            sails.log.error(ex.stack);
          //  res.json({success: false, msg: ex.message});
        });
    },
    buildUrls:function(req,res){
        res.json({success:true,msg:'Running'});
        sails.log.info('Starting buildUrls');
        GenreService.generateSuggestionRankings(0).then(function (err) {
            sails.log.info('done buildUrls');
        }).catch(function (ex) {
            sails.log.error(ex.stack);
            //  res.json({success: false, msg: ex.message});
        });
    }
};

