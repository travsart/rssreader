/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#/documentation/concepts/Logging
 */
var winston = require('winston');
process.env.LOG_PATH = require('path').resolve(__dirname + '.');


module.exports.log = {
    transports: [new (winston.transports.DailyRotateFile)({
        dirname: process.env.LOG_PATH,
        datePattern: '_yyyy-MM-dd.log',
        filename: 'log_debug',
        timestamp: true,
        level: 'debug',
        json: true,
        zippedArchive: true
    }), new (winston.transports.DailyRotateFile)({
        dirname: process.env.LOG_PATH,
        datePattern: '_yyyy-MM-dd.log',
        filename: 'log_info',
        timestamp: true,
        level: 'info',
        json: true,
        zippedArchive: true
    }), new (winston.transports.DailyRotateFile)({
        dirname: process.env.LOG_PATH,
        datePattern: '_yyyy-MM-dd.log',
        filename: 'log_warn',
        timestamp: true,
        level: 'warn',
        json: true,
        zippedArchive: true
    })
    ]
};
