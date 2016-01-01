// config/passport.js

var _ = require('lodash');
var _super = require('sails-auth/config/passport');

_.merge(exports, _super);
_.merge(exports, {

    google: {
        name: 'Google',
        protocol: 'oauth2',
        strategy: require('passport-google-oauth').OAuth2Strategy,
        options: {
            clientID: '802351868445-3jtb4r8le9qjvl66ef96hl2ve1uroloj.apps.googleusercontent.com',
            clientSecret: 'L_E9_rMHgNj_Q8tYyYtPFuBY',
            scope: ['profile', 'email']
        }
    },
    UserController: {
        'create': true
    }
});
