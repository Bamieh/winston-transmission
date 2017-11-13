const serverlessTransmission = require('winston-transmission/serverless');
const logger = require('winston-transmission')({
  logLevel: "warn",
  externalLogging: {
    sentry: 'SENTRY-KEY-XXXX'
  },
});

exportsMock = {};
module.exports.someEvent = function (event, context, callback) {
  callback(null, "Some event");
}

module.exports.anotherEvent = function (event, context, callback) {
  callback(null, "Another event");
}

const parseBody = function (event, context) {
  event.body = JSON.parse(event.body);
}

const removeCC = function (event, context) {
  if (event.body.creditCard) event.body.creditCard.number = '****************'
}

module.exports = serverlessTransmission(module.exports, {
  logger,
  presets: ['aws_lambda'],
  modifiers: [parseBody, removeCC],
});
