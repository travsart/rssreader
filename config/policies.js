module.exports.policies = {
  RssController: {
    '*': ['maxUserAttempt', 'checkForUser'],
    'runcheck': 'maxUserAttempt'
  },
  AdminController: {
    '*': ['maxUserAttempt', 'checkForUser']
  },
  AuthController: {
    '*': 'maxUserAttempt'
  },
  PreferenceController: {
    '*': ['maxUserAttempt', 'checkForUser']
  },
  UserController: {
    '*': ['maxUserAttempt', 'checkForUser']
  },
  AttemptController: {
    '*': ['maxUserAttempt', 'checkForUser']
  }
};
