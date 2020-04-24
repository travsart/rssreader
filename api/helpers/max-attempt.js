/* eslint-disable eqeqeq */
module.exports = {
  friendlyName: 'Max Attempt',
  description: 'Max attempts to login',
  inputs: {
    req: {
      type: 'ref',
      friendlyName: 'Request',
      description: 'A reference to the request object (req).',
      required: true
    }
  },
  exits: {
    failed: {
      description: 'Max attempts on ip and user',
    },
    error: {
      description: 'Max attempts on ip and user',
    }
  },
  fn: async function (inputs, exits) {
    const req = inputs.req;

    const atts = await Attempt.find({
      ip: req.ip
    });

    let counter = 0;
    atts.forEach(att => {
      if (att.attempt > 5) {
        return exits.failed();
      }

      if(att.attempt > 0){
        counter++;
      }
    });

    if (counter > 5) {
      return exits.failed();
    }
    return exits.success();
  }
};
