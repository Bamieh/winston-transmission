import winston from 'winston';
import BrowserConsole from './transports/browser-console';

const defaultExternalLoggingLevel = "warn";
const defaultConfigs = {
  processName: "",
  isProduction: false,
  isBrowser: typeof window !== 'undefined',
  logLevel: "info",
  externalLogging: {},
};

const addConsoleTransport = function(logger, config) {
  if(config.isProduction) return;
  const ConsoleTransport = config.isBrowser? BrowserConsole : winston.transports.Console;
  const transport = new ConsoleTransport({
    level: config.logLevel,
    prettyPrint: true,
    colorize: true,
    silent: false,
    label: config.processName,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint(),
      // function({timestamp, level, message, meta}) {
      //   const formattedLevel = winston.config.colorize(level, level.toUpperCase());
      //   return `[${timestamp()} - ${formattedLevel}] ${undefined !== message ? message : ''}${(meta && Object.keys(meta).length ? '\n\t'+ JSON.stringify(meta) : '')}`;
      // },
    ),
    timestamp: function() {
      return moment().format('HH:mm:ss');
    }
  });

  logger.add(transport);
}

const createWinstonInstance = function(userConfig) {
  const config = Object.assign({}, defaultConfigs, userConfig);

  const logger = winston.createLogger({
    level: config.logLevel,
  })

  addConsoleTransport(logger, config)
  
  logger.level = config.logLevel;

  // External services

  if (config.externalLogging.bugsnag) {
    const bugsnagTransport = require('./transports/bugsnag')
    logger.add(bugsnagTransport, {
      level: config.externalLogging.logLevel || defaultExternalLoggingLevel,
      key: config.externalLogging.bugsnag
    })
  }

  if (config.externalLogging.loggly) {
    require('winston-loggly-bulk')
    logger.add(winston.transports.Loggly, {
      token: config.externalLogging.loggly.token,
      subdomain: config.externalLogging.loggly.subdomain,
      tags: config.externalLogging.loggly.tags,
      level: config.externalLogging.logLevel || defaultExternalLoggingLevel,
      json: true
    })
  }

  if (config.externalLogging.papertrail) {
    require('winston-papertrail').Papertrail; // eslint-disable-line no-unused-expressions
    logger.add(winston.transports.Papertrail, {
      host: config.externalLogging.papertrail.host,
      port: config.externalLogging.papertrail.port,
      level: config.externalLogging.logLevel || defaultExternalLoggingLevel,
      program: config.externalLogging.papertrail.program
    })
  }

  if (config.externalLogging.rollbar) {
    const rollbarTransport = require('./transports/rollbar');
    logger.add(rollbarTransport, {
      level: config.externalLogging.logLevel || defaultExternalLoggingLevel,
      key: config.externalLogging.rollbar,
    })
  }

  if (config.externalLogging.sentry) {
    const sentryTransport = require('./transports/sentry');
    logger.add(sentryTransport, {
      level: config.externalLogging.logLevel || defaultExternalLoggingLevel,
      key: config.externalLogging.sentry,
    })
  }

  return logger
}

export default createWinstonInstance