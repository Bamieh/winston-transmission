import winston from 'winston';

const defaultExternalLevel = "warn";
const defaultConfigs = {
  processName: "",
  isProduction: false,
  isBrowser: typeof window !== 'undefined',
  logLevel: "info",
  external: {},
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

  if (config.external.sentry) {
    const SentryTransport = require('./transports/sentry');
    logger.add(new SentryTransport({
      isBrowser: config.isBrowser,
      level: config.external.logLevel || defaultExternalLevel,
      key: config.external.sentry,
    }))
  }

  return logger
}

module.exports = createWinstonInstance;
