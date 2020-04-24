/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  checkIp: async function (req, res) {
    sails.helpers.getIp(sails.config.custom.ipUrls).then((ip) => {
      res.ok(ip);
    }).catch((err) => {
      res.serverError({
        success: false,
        message: err
      });
    });
  },
  sendIp: async function (req, res) {
    sails.helpers.sendIp().then(() => {
      res.ok();
    }).catch((err) => {
      res.serverError({
        success: false,
        message: err
      });
    });
  }
};

