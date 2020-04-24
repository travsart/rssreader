/* eslint-disable eqeqeq */
const cheerio = require('cheerio');

module.exports = {
  friendlyName: 'Parse anime',
  description: 'Parses anime using cheerio',
  sync: true,
  inputs: {
    page: {
      type: 'string'
    }
  },
  fn: function (inputs, exits) {
    let page = cheerio(inputs.page);

    let re = /(.*)-\n\s+Episode (\d+)/;
    let updated = [];
    let items = page.find('div.name');
    Object.values(items).forEach(item => {
      if (typeof item.children == 'object') {
        Object.values(item.children).forEach(child => {
          if (child.name == 'a') {
            let match = re.exec(child.children[0].data);
            if (match != null) {
              let name = match[1].trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
              let newStart = match[2].trim();
              let updateUrl = child.attribs.href;

              if (updated[name] == null) {
                updated[name] = { start: [newStart], updateUrl: [updateUrl] };
              }
              else {
                updated[name]['start'].push(newStart);
                updated[name]['updateUrl'].push(updateUrl);
              }
            }
          }
        });
      }
    });

    sails.log.info('Parsed ' + updated.length + ' Anime');
    return exits.success(updated);
  }
}