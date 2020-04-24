/* eslint-disable eqeqeq */
/**
 * RssController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  find1: async function (req, res) {
    sails.log.debug('Running custom `find` action');
    let data;

    const sort = req.param('sort');
    const limit = req.param('limit');

    if (sort != null && sort != undefined) {
      if (limit != null && limit != undefined) {
        data = await Rss.find({
          user: req.cookies.user
        }).sort(sort).limit(limit).catch((err) => {
          return res.json({
            success: false,
            msg: 'Error getting rss ' + JSON.stringify(err)
          });
        });
      } else {
        data = await Rss.find({
          user: req.cookies.user
        }).sort(sort).catch((err) => {
          return res.json({
            success: false,
            msg: 'Error getting rss ' + JSON.stringify(err)
          });
        });
      }
    } else if (limit != null && limit != undefined) {
      data = await Rss.find({
        user: req.cookies.user
      }).limit(limit).catch((err) => {
        return res.json({
          success: false,
          msg: 'Error getting rss ' + JSON.stringify(err)
        });
      });
    } else {
      data = await Rss.find({
        user: req.cookies.user
      }).catch((err) => {
        return res.json({
          success: false,
          msg: 'Error getting rss ' + JSON.stringify(err)
        });
      });
    }

    return res.json({
      success: true,
      data: data,
      count: data.length
    });
  },

  runCheck: function (req, res) {
    const type = req.param('type');
    sails.log.info('Starting check');
    if (!(type == null || type == 'Manga' || type == 'Anime' || type == '')) {
      sails.log.error('Must send a valid type: Manga, Anime, or empty string to do both.');
      return res.serverError({
        success: false,
        message: 'Must send a valid type: Manga, Anime, or empty string to do both.'
      });
    }

    //do all
    if (type == null || type == '') {
      return sails.helpers.checkPage('Anime').then((updated) => {
        sails.log.info('Finished anime');
        const count = updated.length;
        sails.log.debug(count);
        return sails.helpers.checkPage('Manga').then((updated1) => {
          sails.log.info('Finished manga');
          const count1 = updated1.length;
          sails.log.debug(count1);
          const data = updated.concat(updated1);
          sails.sockets.blast('reload', {
            data: data
          });

          res.ok({
            success: true,
            data: {
              'Anime': count,
              'Manga': count1,
              data: data
            }
          });
        }).catch((err1) => {
          res.serverError({
            success: false,
            message: err1
          });
        });
      }).catch((err) => {
        res.serverError({
          success: false,
          message: err
        });
      });
    }
    //do just 1 type
    else {
      return sails.helpers.checkPage(type).then((updated) => {
        sails.log.info('Finished check');
        // Broadcast
        sails.sockets.blast(reload, {
          data: updated
        });

        res.ok({
          success: true,
          data: count
        });
      }).catch((err) => {
        res.serverError({
          success: false,
          message: err
        });
      });
    }
  }
};
