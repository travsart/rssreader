const { readFileSync } = require('fs');
const { resolve } = require('path');

module.exports = {
  port: process.env.APP_PORT || 8080,
  ssl: {
    ca: readFileSync(resolve(process.env.SSL_CA)),
    key: readFileSync(resolve(process.env.SSL_KEY)),
    cert: readFileSync(resolve(process.env.SSL_CERT)),
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  hookTimeout: 60000
};
