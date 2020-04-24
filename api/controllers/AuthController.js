/* eslint-disable eqeqeq */
/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {
  login: async function login(req, res) {
    let username = req.param('username');
    const password = req.param('password');
    const cookieSettings = {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true
    };

    if (username == null || username.length < 1) {
      res.json({
        success: false,
        msg: 'Username empty'
      });
    }
    if (password == null || password.length < 1) {
      res.json({
        success: false,
        msg: 'Password empty'
      });
    }
    username = username.toLowerCase();

    res.clearCookie('user');
    let msg = {
      success: false,
      msg: 'Failed to log in.'
    };
    const user = await User.findOne({
      username: username
    });
    if (user) {
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const hash = crypto.createHash('sha256');
        hash.update(user.password + user.username);
        res.cookie('user', user.username + '::' + hash.digest('hex'), cookieSettings);

        msg = {
          success: true,
          msg: 'Successfully logged in',
          user: user.username
        };
        await sails.helpers.updateAttempt(username, req.ip, true);
      }
      else{
        await sails.helpers.updateAttempt(username, req.ip, false);
      }
    }
    else{
      await sails.helpers.updateAttempt(username, req.ip, false);
    }
    res.json(msg);
  },
  logout: function (req, res) {
    res.clearCookie('user');
    res.json({
      success: true,
      msg: 'Logged out'
    });
  },
  authenticated: async function (req, res) {
    return sails.helpers.verifyToken(req)
      .switch({
        error: function (err) {
          return res.serverError(err);
        },
        invalid: function () {
          return res.json({
            success: false,
            msg: 'Not authenticated',
            data: null
          });
        },
        success: function () {
          return res.json({
            success: true,
            msg: 'Authenticated',
            data: req.cookies.user
          });
        }
      });
  }
  // loginnew: async function (req, res) {
  //   sails.log.debug('Login');
  //   if (_.isEmpty(req.param('username')) || _.isEmpty(req.param('password'))) {
  //     return res.json({
  //       success: false,
  //       msg: 'A username and password is required.'
  //     });
  //   }

  //   const username = req.param('username');
  //   let user = await User.findOne({
  //     username: username
  //   });
  //   if (!user) {
  //     return res.json({
  //       success: false,
  //       msg: 'Failed to log in.'
  //     });
  //   }

  //   return bcrypt.compare(req.param('password'), user.password).then(() => {
  //     let token = jwt.sign({
  //       user: user.id
  //     }, sails.config.custom.jwtSecret, {
  //       expiresIn: sails.config.custom.jwtExpires
  //     });

  //     return res.json({
  //       success: true,
  //       data: {
  //         token: token,
  //         username: username
  //       }
  //     });
  //   }).catch((err) => {
  //     sails.log.error(err);
  //     return res.json({
  //       success: false,
  //       msg: 'Failed to log in.'
  //     });
  //   });
  // },

  // post /api/users/register
  // register: function (req, res) {
  //   sails.log.debug('Register');

  //   if (_.isEmpty(req.param('username')) || _.isEmpty(req.param('password'))) {
  //     return res.json({
  //       success: false,
  //       msg: 'A username and password is required.'
  //     });
  //   }

  //   if (req.param('password').length < 3) {
  //     return res.json({
  //       success: false,
  //       msg: 'Password must be at least 3 characters.'
  //     });
  //   }

  //   let user = sails.helpers.createUser({
  //     username: req.param('username'),
  //     password: req.param('password'),
  //   });

  //   // after creating a user record, log them in at the same time by issuing their first jwt token and setting a cookie
  //   let token = jwt.sign({
  //     user: user.id
  //   }, sails.config.custom.jwtSecret, {
  //     expiresIn: sails.config.custom.jwtExpires
  //   });

  //   return res.json({
  //     success: true,
  //     msg: 'Successfully registered',
  //     data: {
  //       token: token,
  //       username: username
  //     }
  //   });
  // },
};
