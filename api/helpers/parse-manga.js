/* eslint-disable eqeqeq */
const Parser = require('rss-parser');
const rua = require('random-useragent');

module.exports = {
  friendlyName: 'Parse manga',
  description: 'Parses manga using rss-parser',
  fn: async function (inputs, exits) {

    const re = /(.*)\s*(?:Episode|Chapter|episode|chapter|ch\.)\s*(\d+\.\d+|\d+)/;
    let updated = {};
    const mpUrl = 'https://mangapark.net/rss/latest.xml';
    const mdUrl = 'https://mangadex.org/rss/NFBr83nsyctpSKAVQe7ZzWPgXq4aUvfb';

    const parser = new Parser({
      headers: {
        'User-Agent': rua.getRandom()
      },
      maxRedirects: 100
    });
    let feed = await parser.parseURL(mpUrl);
    feed.items.forEach(item => {
      try {
        let match = re.exec(item.title);

        if (match != null) {
          let name = match[1];
          name = name.replace(/vol.\d+/g, '');
          name = name.replace(/vol.TBD /g, '');
          name = name.replace(/\(.*\)/g, '').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
          let newStart = match[2].trim();
          if (updated[name] == null || updated[name] == undefined || updated[name]['start'] == undefined) {
            updated[name] = {
              start: [newStart],
              updateUrl: [item.link.substring(0, item.link.length - 2)]
            };
          } else {
            updated[name]['start'].push(newStart);
            updated[name]['updateUrl'].push(item.link.substring(0, item.link.length - 2));
          }
        }
      } catch (e) {
        sails.log.info('Error with mangapark');
        sails.log.info(item.title);
        sails.log.info(item.link);
        sails.log.info(e.stack);
      }
    });
    feed = await parser.parseURL(mdUrl);
    feed.items.forEach(item => {
      try {
        let match = re.exec(item.title);

        if (match != null) {
          let name = match[1];
          name = name.replace(/vol.\d+/g, '');
          name = name.replace(/vol.TBD /g, '');
          name = name.replace(/\(.*\)/g, '').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
          let newStart = match[2].trim();
          if (updated[name] == null) {
            updated[name] = {
              start: [newStart],
              updateUrl: [item.link]
            };
          } else {
            updated[name]['start'].push(newStart);
            updated[name]['updateUrl'].push(item.link);
          }
        }
      } catch (e) {
        sails.log.info('Error getting Mangadex');
        sails.log.info(item.title);
        sails.log.info(item.link);
        sails.log.info(e.stack);
      }
    });
    // Custom pages
    updated = await sails.helpers.parseCustomManga('https://leviatanscans.com/comics/68254-legend-of-the-northern-blade', 'Legend of the Northern Blade', 'leviatanscans', updated);
    updated = await sails.helpers.parseCustomManga('https://leviatanscans.com/comics/i-am-the-sorcerer-king', 'I Am The Sorcerer King', 'leviatanscans', updated);
    updated = await sails.helpers.parseCustomManga('https://leviatanscans.com/comics/866673-the-descent-of-the-demonic-master', 'The Descent of the Demonic Master', 'leviatanscans', updated);
    updated = await sails.helpers.parseCustomManga('https://leviatanscans.com/comics/337225-the-rebirth-of-the-demon-god', 'The Rebirth of the Demon God', 'leviatanscans', updated);
    updated = await sails.helpers.parseCustomManga('https://leviatanscans.com/comics/209074-slave-b', 'Slave B', 'leviatanscans', updated);
    updated = await sails.helpers.parseCustomManga('https://leviatanscans.com/comics/chronicles-of-heavenly-demon', 'Chronicles of Heavenly Demon', 'leviatanscans', updated);

    return exits.success(updated);
  }
}
