const serverlessTransmission = require('winston-transmission/serverless');

module.exports.someEvent = function(event, context, callback) {
  context.log("some information");
  callback(null, "Some event");
}

module.exports.anoherEvent = function(event, context, callback) {
  callback(null, "Anoher event");
}


module.exports = serverlessTransmission({
  exports: module.exports,
  extraLoggingContext: (event, context) => {
    return {
      user: {
        customer: JSON.parse(event.body).customer;
      },
    }
  }
})