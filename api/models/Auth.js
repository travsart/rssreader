/**
 * Auth
 *
 * @module      :: Model
 * @description :: Holds all authentication methods for a User
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

    attributes: require('waterlock').models.auth.attributes({
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        timezone: 'number'
    }),

    beforeCreate: require('waterlock').models.auth.beforeCreate,
    beforeUpdate: require('waterlock').models.auth.beforeUpdate
};
