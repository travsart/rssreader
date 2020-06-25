module.exports = function (req, res, next) {
  sails.helpers.maxAttempt(req)
    .switch({
      error: function (err) {
        return res.serverError(err);
      },
      failed: function () {
        return res.forbidden();
      },
      success: function () {
        return next();
      }
    });
};
