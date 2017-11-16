const winston = require('winston');
const defaultsDeep = require('lodash.defaultsdeep');

const defaultConfig = {
  processName: "",
  isProduction: false,
  isBrowser: typeof window !== 'undefined',
  logLevel: "info",
  external: {
    logLevel: "warn",
  },
};

const addConsoleTransport = function(logger, config) {
  if(config.isProduction) return;

  if(config.isBrowser) {
    process.stdout = require('browser-stdout')({level: false});
  }

  const transport = new winston.transports.Console({
    level: config.logLevel,
    prettyPrint: true,
    colorize: true,
    silent: false,
    label: config.processName,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint()
    ),
  });

  logger.add(transport);
}

const createWinstonInstance = function(userConfig) {
  const config = defaultsDeep(defaultConfig, userConfig);

  const logger = winston.createLogger({
    level: config.logLevel,
  })

  addConsoleTransport(logger, config)

  logger.level = config.logLevel;

  // External services

  if (config.external.sentry) {
    const SentryTransport = require('./transports/sentry');
    logger.add(new SentryTransport({
      isBrowser: config.isBrowser,
      level: config.external.logLevel,
      key: config.external.sentry,
    }))
  }

  return logger
}

module.exports = createWinstonInstance;
