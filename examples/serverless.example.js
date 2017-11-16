const serverlessTransmission = require('winston-transmission/serverless');
const logger = serverlessTransmission.setup({
  logger: {
    logLevel: "warn",
    external: {
      sentry: 'SENTRY-KEY-XXXX'
    }
  },
  presets: ['aws_lambda'],
  modifiers: [parseBodyModifier, removeCC],
})


module.exports.someEvent = function (event, context, callback) {
  logger.info('hello!');
  callback(null, "Some event");
}

module.exports.anotherEvent = function (event, context, callback) {
  callback(null, "Another event");
}

function parseBodyModifier(event, context) {
  event.body = JSON.parse(event.body);
}

function removeCCModifier(event, context) {
  if (event.body.creditCard) event.body.creditCard.number = '****************'
}