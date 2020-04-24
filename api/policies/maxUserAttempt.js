module.exports = function (req, res, next) {
  sails.helpers.maxAttempt(req)
    .switch({
      error: function (err) {
        return res.serverError(err);
      },
      invalid: function () {
        return res.forbidden();
      },
      success: function () {
        return next();
      }
    });
};
