/**
 * RssController
 *
 * @description :: Server-side logic for managing rsses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    generate: function (req, res) {
        var page = req.param('page');
        var end = req.param('end');

        if(isNaN(parseInt(page)) || page < 0){
            page = 0;
        }

        if (end == null || end <= page) {
            end = -1;
        }

        sails.log.info('generate');
        GenreService.generate(page,end).then(function (err) {
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
        Genre.destroy({}).then(function (err) {
            res.json({err: err});
        });
    }
};

