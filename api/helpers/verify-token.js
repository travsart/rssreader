/* eslint-disable eqeqeq */
const crypto = require('crypto');

module.exports = {
  friendlyName: 'Verify token',
  description: 'Verify a token.',
  inputs: {
    req: {
      type: 'ref',
      friendlyName: 'Request',
      description: 'A reference to the request object (req).',
      required: true
    }
  },
  exits: {
    invalid: {
      description: 'Invalid token or no authentication present.',
    },
    error: {
      description: 'Error validating token.',
    }
  },
  fn: async function (inputs, exits) {
    const req = inputs.req;

    if (req.cookies != null && req.cookies.hasOwnProperty('user') && req.cookies.user != null) {
      const verify = req.cookies.user.split('::');
      const user = await User.findOne({
        username: verify[0]
      });

      if (user != null && user != undefined) {
        const hash = crypto.createHash('sha256');
        hash.update(user.password + user.username);
        const hex = hash.digest('hex');

        if (verify[1] == hex) {
          return exits.success(user);
        }
      }
    }
    return exits.invalid();
  }
};
