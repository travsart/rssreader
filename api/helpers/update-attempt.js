module.exports = {
  friendlyName: 'Update Attempt',
  description: 'Update max attempt',

  inputs: {
    username: {
      type: 'string'
    },
    ip: {
      type: 'string'
    },
    clear: {
      type: 'boolean'
    }
  },

  exits: {
    invalid: {
      description: 'Cannont update or create attempt',
    }
  },

  fn: async function (inputs, exits) {
    let att = await Attempt.findOne({
      userip: inputs.username + inputs.ip
    });

    if (!att) {
      att = await Attempt.create({
          userip: inputs.username + inputs.ip,
          user: inputs.username,
          ip: inputs.ip
        })
        .intercept({
          name: 'UsageError'
        }, () => 'invalid')
        .fetch();
    }

    if (inputs.clear) {
      await Attempt.update({
        'id': att.id
      }).set({
        attempt: 0
      });
    } else {
      await Attempt.update({
        'id': att.id
      }).set({
        attempt: att.attempt + 1
      });
    }
    return exits.success();
  }
};
