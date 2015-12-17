/**
 * RssController
 *
 * @description :: Server-side logic for managing rsses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    generate: function (req, res) {
        var end = req.param('end');

        if (end == null) {
            end = -1;
        }
        sails.log.info('generate');
        GenreService.generate(end).then(function (err) {
            if (err) {
                sails.log.error(err.msg);
                res.json({success: false, msg: err.msg, err: err});
            }
            res, json({success: true, msg: ''});
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

