module.exports = {
    login: function (req, res) {
        var username = req.param('username');
        var password = req.param('password');
        req.session.user = '';

        if (username == null || username.length < 1) {
            res.json({success: false, msg: 'Username empty'});
        }
        if (password == null || password.length < 1) {
            res.json({success: false, msg: 'Password empty'});
        }
        User.findOne({
            username: username
        }).then(function (user, err) {
            if (user) {
                if (user.verifyPassword(password)) {
                    req.session.user = user;
                    res.json({success: true, msg: ''});
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
                        res.json({success: true, msg: '', user: user});
                    }
                });
            }
        });
        //req.session.user
    },
    logout: function (req, res) {
        req.session.user = '';
        res.json({success: true, msg: ''});
    }
};