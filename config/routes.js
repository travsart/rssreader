module.exports.routes = {
  'GET /rss': function (req, res) {
    res.redirect('/?route=rss');
  },
  'GET /login': {
    target: '/'
  },
  'GET /preference': function (req, res) {
    res.redirect('/?route=preference');
  },
  'GET /logout': function (req, res) {
    res.redirect('/?route=logout');
  },
  'GET /api/runcheck': 'RssController.runCheck',
  'GET /api/find1': 'RssController.find1',
  'GET /api/checkip': 'AdminController.checkip',
  'GET /api/sendip': 'AdminController.sendip',
  'GET /api/authenticated': 'AuthController.authenticated',
  'POST /api/login': 'AuthController.login',
  'POST /api/logout': 'AuthController.logout',
  'GET /' : { policy: 'maxUserAttempt' }
};
