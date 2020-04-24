var winston = require('winston');
require('winston-daily-rotate-file');

const {resolve} = require('path');
process.env.LOG_DIR = resolve(process.env.LOG_DIR);

var logger = winston.createLogger({
  transports: [
    new (winston.transports.DailyRotateFile)({
      filename: 'log-' + process.env.LOG_LEVEL +'-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '10',
      dirname: process.env.LOG_DIR,
      level: process.env.LOG_LEVEL,
      json: false,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(i => `${i.timestamp} | ${i.message}`)
      ),
    })
  ]
});
winston.remove(winston.transports.Console);

module.exports.log = {
  level: process.env.LOG_LEVEL,
  custom: logger,
  inspect: false
};
