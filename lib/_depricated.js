import winston from 'winston';

let logger = null;
let options = null;

const DEFAULT_OPTIONS = {
  level: 'info',
  colorize: true,
  timestamp: true,
  prettyPrint: false,
  prefix: "",
};

const transmission = {
  establishConnection(config) {
    options = Object.assign({}, DEFAULT_OPTIONS, config);

    logger = new winston.Logger({
      transports: [
        new winston.transports.Console(options),
      ],
    });

    delete transmission.init;
  },
  error(message, meta) {
    return logger.log('error', `${options.prefix}${message}`, meta);
  },
  warn(message, meta) {
    return logger.log('warn', `${options.prefix}${message}`, meta);
  },
  info(message, meta) {
    return logger.log('info', `${options.prefix}${message}`, meta);
  },
  verbose(message, meta) {
    return logger.log('verbose', `${options.prefix}${message}`, meta);
  },
  debug(message, meta) {
    return logger.log('debug', `${options.prefix}${message}`, meta);
  },
  silly(message, meta) {
    return logger.log('silly', `${options.prefix}${message}`, meta);
  },
};

export default transmission;