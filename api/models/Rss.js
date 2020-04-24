module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    updateUrl: {
      type: 'string',
      allowNull: true
    },
    start: {
      type: 'number',
      defaultsTo: 1
    },
    pre: {
      type: 'number',
      defaultsTo: 0
    },
    _type: {
      type: 'string',
      isIn: ['Anime', 'Manga'],
      defaultsTo: 'Manga'
    },
    _check: {
      type: 'boolean',
      defaultsTo: true
    },
    user: {
      type: 'string',
      required: true
    },
    rating: {
      type: 'number',
      allowNull: true
    },
    description: {
      type: 'string',
      allowNull: true
    },
    updatedAt: {
      type: 'number',
      defaultsTo: (new Date()).getTime()
    }
  },
  beforeUpdate: function (attrs, cb) {
    attrs.updatedAt = (new Date()).getTime();
    cb();
  }
};
