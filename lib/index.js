import winston from 'winston';

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
      winston.format.prettyPrint(),
      // function({timestamp, level, message, meta}) {
      //   const formattedLevel = winston.config.colorize(level, level.toUpperCase());
      //   return `[${timestamp()} - ${formattedLevel}] ${undefined !== message ? message : ''}${(meta && Object.keys(meta).length ? '\n\t'+ JSON.stringify(meta) : '')}`;
      // },
    ),
    // timestamp: function() {
      // return moment().format('HH:mm:ss');
    // }
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

  if (config.externalLogging.sentry) {
    console.log('sentry config detected');
    const SentryTransport = require('./transports/sentry');
    logger.add(new SentryTransport({
      isBrowser: config.isBrowser,
      level: config.externalLogging.logLevel || defaultExternalLoggingLevel,
      key: config.externalLogging.sentry,
    }))
  }

  return logger
}

modules.exports = createWinstonInstance;
