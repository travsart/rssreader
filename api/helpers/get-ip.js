/* eslint-disable eqeqeq */
const rp = require('request-promise');
const rua = require('random-useragent');

module.exports = {
  friendlyName: 'Get Ip',
  description: 'Gets the current ip reported by the array of urls supplied',

  inputs: {
    urls: {
      type: 'ref'
    }
  },

  exits: {
    noIp: {
      description: 'Could not determine ip'
    }
  },

  fn: async function (inputs, exits) {
    if (inputs.urls.length > 0) {
      let url = inputs.urls.shift();
      sails.log.info('Querying ip from: ' + url);

      rp({ url: url, headers: { 'User-agent': rua.getRandom() } }).then((body) => {
        if (body == null || body == '') {
          return sails.helpers.getIp(inputs.urls);
        }
        else {
          if (body.includes(',')) {
            body = body.split(',')[0];
          }
          sails.log.info('Found ip: ' + body);
          return exits.success(body);
        }
      }).catch((err) => {
        sails.log(err);
        return sails.helpers.getIp(inputs.urls);
      });
    }
    else {
      throw 'noIp';
    }
  }
};
