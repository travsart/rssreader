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
process.env.LOG_PATH = require('path').resolve('.');

winston.remove(winston.transports.Console);
module.exports.log = {
    level: 'info',
    transports: [
        {
            module: winston.transports.DailyRotateFile,
            config: {
                dirname: process.env.LOG_PATH,
                name: 'dr.info',
                datePattern: '_yyyy-MM-dd.log',
                filename: 'log_info',
                timestamp: true,
                level: 'info',
                json: false,
                colorize: false,
                zippedArchive: true
            }
        }]
};
