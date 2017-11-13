'use strict'
const winston = require('winston')

class SentryLogger extends winston.Transport {
  constructor(options) {
    super(options);
    this.name = 'sentryLogger'
    this.level = options.level || 'warn'
    this.raven = require('raven')
    this.raven.config(options.key).install()
  }

  log(info, callback) {
    info.level = info.level === 'warn' ? 'warning' : info.level;

    if(info instanceof Error) {
      this.raven.captureException(info, {level: info.level});
    } else {
      this.raven.captureMessage(info.message, {level: info.level});
    }
    callback()
  }
}

export default SentryLogger;
