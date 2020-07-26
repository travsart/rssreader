/* eslint-disable eqeqeq */
const Parser = require('rss-parser');
const rua = require('random-useragent');

const customManga = [
  ['https://leviatanscans.com/comics/68254-legend-of-the-northern-blade', 'Legend of the Northern Blade', 'leviatanscans'],
  ['https://leviatanscans.com/comics/i-am-the-sorcerer-king', 'I Am The Sorcerer King', 'leviatanscans'],
  ['https://leviatanscans.com/comics/866673-the-descent-of-the-demonic-master', 'The Descent of the Demonic Master', 'leviatanscans'],
  ['https://leviatanscans.com/comics/337225-the-rebirth-of-the-demon-god', 'The Rebirth of the Demon God', 'leviatanscans'],
  ['https://leviatanscans.com/comics/209074-slave-b', 'Slave B', 'leviatanscans'],
  ['https://leviatanscans.com/comics/chronicles-of-heavenly-demon', 'Chronicles of Heavenly Demon', 'leviatanscans'],
  ['https://leviatanscans.com/comics/612457-tale-of-a-scribe-who-retires-to-the-countryside', 'Tale of a Scribe Who Retires to the Countryside', 'leviatanscans'],
  ['https://leviatanscans.com/comics/762211-bless', 'Bless', 'leviatanscans'],
  ['https://leviatanscans.com/comics/11268-survival-story-of-a-sword-king-in-a-fantasy-world', 'Survival Story of a Sword King in a Fantasy World', 'leviatanscans'],
  ['https://reaperscans.com/comics/140270-the-great-mage-returns-after-4000-years', 'The Great Mage Returns After 4000 Years', 'reaperscans'],
  ['https://reaperscans.com/comics/915623-god-of-blackfield', 'God Of Blackfield', 'reaperscans'],
  ['https://reaperscans.com/comics/616418-kill-the-hero', 'Kill the Hero', 'reaperscans'],
  ['https://reaperscans.com/comics/407643-overgeared', 'Overgeared', 'reaperscans'],
  ['https://reaperscans.com/comics/668397-omniscient-readers-viewpoint', 'Omniscient Reader\'s Viewpoint', 'reaperscans'],
  ['https://reaperscans.com/comics/457996-the-sword-of-glory', 'The Sword of Glory', 'reaperscans'],
  ['https://reaperscans.com/comics/920842-winner-takes-all', 'Winner Takes All', 'reaperscans'],
  ['https://reaperscans.com/comics/967620-player', 'Player', 'reaperscans']
];

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

    try {
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
    } catch (e) {
      sails.log.info('Error getting mangadex');
      sails.log.info(e.stack);
    }

    try {
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
    } catch (e) {
      sails.log.info('Error getting mangapark');
      sails.log.info(e.stack);
    }

    // Custom pages
    sails.log.info('Starting custom Manga');
    customManga.forEach(async c => {
      try {
        updated = await sails.helpers.parseCustomManga(c[0], c[1], c[2], updated);
      } catch (e) {
        sails.log.info('Error getting custom');
        sails.log.info(c);
        sails.log.info(e.stack);
      }
    });
    return exits.success(updated);
  }
};
