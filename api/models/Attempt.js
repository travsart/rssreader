module.exports = {
  attributes: {
    userip: {
      type: 'string',
      required: true,
      unique: true
    },
    user: {
      type: 'string',
      required: true
    },
    ip: {
      type: 'string',
      required: true
    },
    attempt: {
      type: 'number',
      defaultsTo: 0
    }
  }
};
