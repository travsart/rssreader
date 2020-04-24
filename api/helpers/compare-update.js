/* eslint-disable eqeqeq */
module.exports = {
  friendlyName: 'Compare update',
  description: 'Compare the latest updates with what is in the database.',
  inputs: {
    updated: {
      type: 'ref'
    },
    type: {
      type: 'string'
    }
  },
  exits: {
    updateError: {
      description: 'Could not update records.'
    }
  },
  fn: async function (inputs, exits) {
    let updated = inputs.updated;
    let type = inputs.type;
    let updatedRss = [];

    try {
      let rsses = await Rss.find({ _check: true, _type: type });
      sails.log.debug(rsses.length);


      await rsses.forEach(async (rss) => {
        try {
          // maybe should do this case insinsitive
          const checkName = rss.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
          if (updated.hasOwnProperty(checkName)) {
            let newItem = updated[checkName];
            let index = -1;
            for (let i = 0; i < newItem['start'].length; i++) {
              let newStart = newItem['start'][i];
              if (newStart > rss.start && (newStart < newItem['start'][index] || index == -1)) {
                index = i;
              }
            }
            if (index != -1) {
              rss.pre = parseFloat(rss.start);
              rss.start = parseFloat(newItem['start'][index]);
              rss.updateUrl = newItem['updateUrl'][index];
              rss._check = false;
              rss.updatedAt = (new Date()).getTime();
              updatedRss.push(rss);
              await Rss.update({ 'id': rss.id }).set({ pre: rss.pre, start: rss.start, updateUrl: rss.updateUrl, _check: false });
            }
          }
        }
        catch (ex) {
          sails.log.info('error');
          sails.log.info(ex.message);
        }
      });
      sails.log.info('Finished updating');

      if (updatedRss.length > 0) {
        sails.log.debug(updatedRss);
      }
      return exits.success(updatedRss);
    }
    catch (err) {
      sails.log.error(err);
      throw 'updateError';
    }
  }
};

