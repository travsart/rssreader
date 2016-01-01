
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var SALT_WORK_FACTOR = 10;

module.exports = {

    attributes: {
        username: {
            type: 'string',
            required: true,
            unique: true,
            minLength: 3,
            maxLength: 30
        },
        password:{
            type: 'string',
            required: true,
            minLength: 6,
            maxLength: 50
        },
        keys: {
            collection: 'key',
            via: 'owner'
        },

        verifyPassword: function (password) {
            return bcrypt.compareSync(password, this.password);
        },

        changePassword: function(newPassword, cb){
            this.newPassword = newPassword;
            this.save(function(err, u) {
                return cb(err,u);
            });
        },

        toJSON: function() {
            var obj = this.toObject();
            return obj;
        }
    },

    beforeCreate: function (attrs, cb) {
        bcrypt.hash(attrs.password, SALT_WORK_FACTOR, function (err, hash) {
            attrs.password = hash;
            return cb();
        });
    },

    beforeUpdate: function (attrs, cb) {
        if(attrs.newPassword){
            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if (err) return cb(err);

                bcrypt.hash(attrs.newPassword, salt, function(err, crypted) {
                    if(err) return cb(err);

                    delete attrs.newPassword;
                    attrs.password = crypted;
                    return cb();
                });
            });
        }
        else {
            return cb();
        }
    }
};
