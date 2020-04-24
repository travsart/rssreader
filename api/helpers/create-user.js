module.exports = {
  friendlyName: 'Create user',
  description: 'Create a new user.',

  inputs: {
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
  },

  exits: {
    invalid: {
      description: 'The provided username address and/or password are invalid.',
    },
    usernameAlreadyInUse: {
      description: 'The provided username address is already in use.',
    },
  },

  fn: async function (inputs, exits) {
    var attr = {
      password: inputs.password,
      username: inputs.username.toLowerCase()
    };

    var user = await User.create(attr)
      .intercept('E_UNIQUE', ()=>{ return new Error('There is already an account using that name!');})
      .intercept({ name: 'UsageError' }, () => 'invalid')
      .fetch();

    return exits.success(user);
  }
};
