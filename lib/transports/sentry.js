'use strict'
const TransportStream = require('winston-transport');

class SentryLogger extends TransportStream {
  constructor(options) {
    super(options);
    this.name = 'sentryLogger'
    this.level = options.level || 'warn'
    this.isBrowser = options.isBrowser;
    this.raven = this.isBrowser? require('raven-js') : require('raven');

    this.raven.config(options.key).install()
  }
  log(...args) {
    if(this.isBrowser) {
      const [level, msg, meta, callback] = args;

      if(msg instanceof Error) {
        this.raven.captureException(msg, {level: level, meta: meta});
      } else {
        this.raven.captureMessage(msg, {level: level, meta: meta});
      }

      callback();
    } else {
      const [info, callback] = args;

      info.level = info.level === 'warn' ? 'warning' : info.level;

      if(info instanceof Error) {
        this.raven.captureException(info, {level: info.level});
      } else {
        this.raven.captureMessage(info.message, {level: info.level});
      }
      callback()
    };

  }
}

module.exports = SentryLogger;
