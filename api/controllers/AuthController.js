module.exports = {
    login: function (req, res) {
        var username = req.param('username');
        var password = req.param('password');
        var cookieSettings = {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true};
        if (username == null || username.length < 1) {
            res.json({success: false, msg: 'Username empty'});
        }
        if (password == null || password.length < 1) {
            res.json({success: false, msg: 'Password empty'});
        }

        res.clearCookie('user');
        User.findOne({
            username: username
        }).then(function (user, err) {
            if (user) {
                if (user.verifyPassword(password)) {
                    res.cookie('user', user, cookieSettings);
                    res.json({success: true, msg: '', user: user});
                }
                else {
                    res.json({success: false, msg: 'Password incorrect'});
                }
            }
            else {
                User.create({username: username, password: password}).then(function (user, err) {
                    sails.log.info(JSON.stringify(user));
                    if (err) {
                        res.json({success: false, msg: 'Error creating user ' + JSON.stringify(err)});
                    }
                    else {
                        res.cookie('user', user, cookieSettings);
                        res.json({success: true, msg: '', user: user});
                    }
                });
            }
        });
        //req.session.user
    },
    logout: function (req, res) {
        res.clearCookie('user');
        res.json({success: true, msg: ''});
    },

    home: function (req, res) {
        return res.view({
            view: '/auth/home',
            locals: {
                username: (req.cookies.user && req.cookies.user.hasOwnProperty('username')) ? req.cookies.user.username : ''
            }
        });
    }
};