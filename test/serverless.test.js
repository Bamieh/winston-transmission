import NOOP from './fixture/noop';
import createLogger from '../lib';
import eventFixture from './fixture/event';
import contextFixture from './fixture/context';
import serverlessTransmission from '../lib/serverless';

describe.only('Serverless', function () {
  before(function () {
    const exportsMock = {};
    const logger = createLogger({
      logLevel: "warn",
      externalLogging: {
        sentry: 'https://7751fdb7a2be4f309350319e802b62af:e31dfab149214b43b9e94d28e281dcbb@sentry.io/238615'
      },
    });

    exportsMock.someEvent = function (event, context, callback) {
      logger.warn('Hello world!');
      callback(null, "Some event");
    }

    exportsMock.anotherEvent = function (event, context, callback) {
      throw new Error("exception");
      callback(null, "Another event");
    }

    function filterSensitiveInformation(event, context) {
      event.body = JSON.parse(event.body)
      if (event.body.creditCard) event.body.creditCard.number = '****************';
      if (event.body.creditCard) event.body.creditCard.cvv = '***';

      return {event, context}
    }

    this.exports = serverlessTransmission(exportsMock, {
      logger: logger,
      presets: ['aws_lambda'],
      modifiers: [filterSensitiveInformation],
      customContext: {
        user: {
          email: 'test@yamsafer.me'
        }
      }
    });
  });

  it('lib exports serverless', function () {
    expect(serverlessTransmission).to.be.a('function');
  });

  it('wraps exports with transmission function', function () {
    expect(this.exports).to.be.an('object')
  });
  it('executes a lambda function with logger', function () {
    this.exports.someEvent(eventFixture, contextFixture, NOOP)
  })
});