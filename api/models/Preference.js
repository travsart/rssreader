module.exports = {
  attributes: {
    user: {
      type: 'string',
      required: true,
      unique: true
    },
    sortCol: {
      type: 'string',
      defaultsTo: 'updateUrl'
    },
    sortDir: {
      type: 'string',
      defaultsTo: 'DESC'
    },
    filterCol: {
      type: 'string',
      defaultsTo: ''
    },
    filterVal: {
      type: 'string',
      defaultsTo: ''
    }
  }
};
