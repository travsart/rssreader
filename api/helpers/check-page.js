/* eslint-disable eqeqeq */
const rp = require('request-promise');
const rua = require('random-useragent');

module.exports = {
  friendlyName: 'Check page',
  description: '',
  inputs: {
    type: {
      type: 'string',
      required: true
    }
  },
  exits: {
    fetchError: {
      description: 'Their has been an issue checking requested pages.',
    }
  },


  fn: async function (inputs, exits) {
    let type = inputs.type;
    let updated = [];

    if (type == 'Anime') {
      const url = 'https://www.animefreak.tv/home/latest-episodes/page/1';
      return rp({ url: url, headers: { 'User-agent': rua.getRandom() } }).then((body) => {
        if (body == null || body == '') {
          sails.log.error('Got blank page from: ' + url);
          throw 'fetchError';
        }
        else {
          sails.log.debug('Got page for Anime');
          updated = sails.helpers.parseAnime(body);

          if (updated == null) {
            throw 'fetchError';
          }
          else {
            sails.log.debug('Will now be checking against db. Found ' + updated.length + ' updates');
            return sails.helpers.compareUpdate(updated, type).then((count) => {
              return exits.success(count);
            });
          }
        }
      }).catch((err) => {
        sails.log.error(err.message);
        throw 'fetchError';
      });
    }
    else {
      sails.log.info('Starting Manga');
      updated = await sails.helpers.parseManga();
      sails.log.info('Finished Manga');
      const count = await sails.helpers.compareUpdate(updated, type);
      return exits.success(count);
    }
  }
};

