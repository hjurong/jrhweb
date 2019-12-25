/*
 * logger setup
 */

const appSettings = require('../config/app-settings');
const log4js = require('log4js');

// Logger configuration
log4js.configure({
  appenders: { 
      fileAppender: { 
        type: 'dateFile', 
        filename: appSettings.logfile,
        compress: true,
        keepFileExt: true,
      },
      console: { type: 'console' } 
  },
  categories: { 
      default: { appenders: ['fileAppender', 'console'], level: 'debug' } 
  }
});

const logger = log4js.getLogger();

function setLogLevel(newLevel) {
  logger.level = newLevel;
}

function getLogger(name) {
    return log4js.getLogger(name);
}

function log(level, message) {
  switch (level) {
    case Level.TRACE:
      logger.trace(message);
      break;
    case Level.DEBUG:
      logger.debug(message);
      break;
    case Level.WARN:
      logger.warn(message);
      break;
    case Level.ERROR:
      logger.error(message);
      break;
    case Level.FATAL:
      logger.fatal(message);
      break;
    case Level.INFO:
    default:
      logger.info(message);
  }
}

function trace(message) {
  return log(Level.TRACE, message);
}

function debug(message) {
  return log(Level.DEBUG, message);
}

function info(message) {
  return log(Level.INFO, message);
}

function warn(message) {
  return log(Level.WARN, message);
}

function error(message) {
  return log(Level.ERROR, message);
}

function fatal(message) {
  return log(Level.FATAL, message, source, logFunction);
}

module.exports.trace = trace;
module.exports.debug = debug;
module.exports.info = info;
module.exports.warn = warn;
module.exports.error = error;
module.exports.fatal = fatal;
module.exports.getLogger = getLogger;
module.exports.setLogLevel = setLogLevel;
