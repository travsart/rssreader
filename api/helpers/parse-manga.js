/* eslint-disable eqeqeq */
const Parser = require('rss-parser');

module.exports = {
  friendlyName: 'Parse manga',
  description: 'Parses manga using cheerio',
  fn: async function (inputs, exits) {

    const re = /(.*)\s*(?:Episode|Chapter|episode|chapter|ch\.)\s*(\d+\.\d+|\d+)/;
    let updated = [];
    const url = 'https://mangapark.net/rss/latest.xml';

    const parser = new Parser({ headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36' }, maxRedirects: 100 });
    let feed = await parser.parseURL(url);
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
            updated[name] = { start: [newStart], updateUrl: [item.link.substring(0, item.link.length - 2)] };
          }
          else {
            updated[name]['start'].push(newStart);
            updated[name]['updateUrl'].push(item.link.substring(0, item.link.length - 2));
          }
        }
      }
      catch (e) {
        sails.log.info(e);
      }
    });
    return exits.success(updated);
  }
}

