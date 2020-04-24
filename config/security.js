module.exports.security = {
  cors: {
    allRoutes: true,
    allowOrgins: '*',
    allowRequestMethods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH'
  },
  csrf: false
};
