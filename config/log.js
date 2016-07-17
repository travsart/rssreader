var winston = require('winston');
var customLogger = new winston.Logger();

// A console transport logging debug and above.
customLogger.add(winston.transports.DailyRotateFile, {
    level: 'info',
    dirname: process.env.LOG_PATH,
    datePattern: '_yyyy-MM-dd.log',
    filename: 'log_info',
    timestamp: true,
    zippedArchive: true
});

process.env.LOG_PATH = require('path').resolve('.');

winston.remove(winston.transports.Console);
module.exports.log = {
    level: 'info',
    custom: customLogger,
    inspect: false
};
