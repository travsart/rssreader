const nodemailer = require('nodemailer');

module.exports = {
  friendlyName: 'Get Ip',
  description: 'Gets the current ip reported by the array of urls supplied',

  inputs: {
    urls: {
      type: 'ref'
    }
  },

  exits: {

    failedToSend: {
      description: 'Could not send ip'
    }
  },

  fn: async function (inputs, exits) {
    const transporter = nodemailer.createTransport(sails.config.custom.emailUrl);

    let mailOptions = {
      from: sails.config.custom.fromEmail,
      to: sails.config.custom.toEmail,
      subject: 'IP',
      text: ''
    };

    return sails.helpers.getIp(sails.config.custom.ipUrls).then((ip) => {
      mailOptions.text = 'Current IP is: ' + ip;
      return transporter.sendMail(mailOptions).then(() => {
        sails.logger.debug('Email sent');
        return exits.success();
      }).catch((err) => {
        sails.log.error(err);
        throw 'failedToSend';
      });
    }).catch((err) => {
      sails.log.error(err);
      throw 'failedToSend';
    });
  }
};
