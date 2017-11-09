import winston from 'winston';

const defaultExternalLogging = {
  logLevel: "warn",
};

const defaultConfigs = {
  processName: "",
  logLevel: "info",
};

const createWinstonInstance = function(configs) {
  const {
    logLevel,
    processName,
  } = {...defaultConfigs, ...configs};

  const externalLogging = Object.assign({},
    defaultExternalLogging,
    externalLogging,
  );

  const logger = new (winston.Logger)({
    level: logLevel,
    transports: [
      new (winston.transports.Console)({
        level: logLevel,
        prettyPrint: true,
        colorize: true,
        silent: false,
        label: processName,
        formatter: function({timestamp, level, message, meta}) {
          const formattedLevel = winston.config.colorize(level, level.toUpperCase());
          return `[${timestamp()} - ${formattedLevel}] ${undefined !== message ? message : ''}${(meta && Object.keys(meta).length ? '\n\t'+ JSON.stringify(meta) : '')}`;
        },
        timestamp: function() {
          return moment().format('HH:mm:ss');
        }
      })
    ]
  })

  logger.transports.console.level = logLevel;
  logger.level = logLevel;

  // External services

  if (externalLogging.bugsnag) {
    const bugsnagTransport = require('./transports/bugsnag')
    logger.add(bugsnagTransport, {
      level: externalLogging.logLevel,
      key: externalLogging.bugsnag
    })
  }

  if (externalLogging.loggly) {
    require('winston-loggly-bulk')
    logger.add(winston.transports.Loggly, {
      token: externalLogging.loggly.token,
      subdomain: externalLogging.loggly.subdomain,
      tags: externalLogging.loggly.tags,
      level: externalLogging.logLevel,
      json: true
    })
  }

  if (externalLogging.papertrail) {
    require('winston-papertrail').Papertrail; // eslint-disable-line no-unused-expressions
    logger.add(winston.transports.Papertrail, {
      host: externalLogging.papertrail.host,
      port: externalLogging.papertrail.port,
      level: externalLogging.logLevel,
      program: externalLogging.papertrail.program
    })
  }

  if (externalLogging.rollbar) {
    const rollbarTransport = require('./transports/rollbar');
    logger.add(rollbarTransport, {
      level: externalLogging.logLevel,
      key: externalLogging.rollbar,
    })
  }

  if (externalLogging.sentry) {
    const sentryTransport = require('./transports/sentry');
    logger.add(sentryTransport, {
      level: externalLogging.logLevel,
      key: externalLogging.sentry,
    })
  }

  return logger
}

export default createWinstonInstance