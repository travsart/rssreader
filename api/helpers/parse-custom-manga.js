/* eslint-disable eqeqeq */
const ch = require('cheerio');
const rp = require('request-promise');
const rua = require('random-useragent');

module.exports = {
  friendlyName: 'Parse custom manga',
  description: 'Parses manga using cheerio',
  inputs: {
    url: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    site: {
      type: 'string'
    },
    updated: {
      type: 'ref'
    }
  },
  exits: {

    success: {
      outputFriendlyName: 'Updated value',
      outputDescription: 'Updated the value found.',
    },

    noUsersFound: {
      getFailed: 'Failed to get url.'
    }

  },
  fn: async function (inputs, exits) {

    let updated = inputs.updated;
    try {

      if (inputs.site == 'leviatanscans') {
        return rp({
          url: inputs.url,
          headers: {
            'User-agent': rua.getRandom()
          }
        }).then((page) => {
          page = ch.load(page);
          url = page('a.item-author')[0].attribs.href;
          res = url.split('/');
          updated[inputs.name.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '')] = {
            start: [res[res.length - 1]],
            updateUrl: [url]
          };
          return exits.success(updated);
        });
      } else {
        return exits.success(updated);
      }
    } catch (e) {
      sails.log.info('Error getting ' + name + ' from url: ' + inputs.name);
      sails.log.info(e.stack);
      throw 'getFailed';
    }
  }
};
