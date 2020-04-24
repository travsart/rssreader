var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 13;

module.exports = {
  attributes: {
    username: {
      type: 'string',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      required: true
    }
  },

  verifyPassword: function (password) {
    return bcrypt.compareSync(password, this.password);
  },

  beforeCreate: function (attrs, cb) {
    bcrypt.hash(attrs.password, SALT_WORK_FACTOR, (err, hash) => {
      sails.log(err);
      attrs.password = hash;
      return cb();
    });
  },

  beforeUpdate: function (attrs, cb) {
    if (attrs.newPassword) {
      bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {return cb(err);}

        bcrypt.hash(attrs.newPassword, salt, (err, crypted) => {
          if (err) {return cb(err);}

          delete attrs.newPassword;
          attrs.password = crypted;
          return cb();
        });
      });
    }
    else {
      return cb();
    }
  },
  customToJSON() {
    // obviously never return password downstream to anyone, ever
    return _.omit(this, [
      'password',
    ]);
  }
};
