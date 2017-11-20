const NOOP = require('./fixture/noop');
const eventFixture = require('./fixture/event');
const contextFixture = require('./fixture/context');
const serverlessTransmission = require('../serverless');

describe.only('Serverless', function () {
  before(function () {
    const mockModule = {exports: {}};

    const logger = serverlessTransmission({
      proxyObj: mockModule,
      logger: {
        logLevel: "warn",
        external: {
          sentry: {
            key: 'https://7751fdb7a2be4f309350319e802b62af:e31dfab149214b43b9e94d28e281dcbb@sentry.io/238615',
            context: event => {
              return {
                user: {
                  email: event.body.customer.email
                }
              }
            }
          },
        },
      },
      presets: ['aws_lambda'],
      modifiers: [filterSensitiveInformation]
    });

    mockModule.exports.someEvent = function (event, context, callback) {
      logger.warn('Hello world!');
      throw new Error("testing");
      callback(null, "Some event");
    }

    mockModule.exports.anotherEvent = function (event, context, callback) {
      throw new Error("exception");
      callback(null, "Another event");
    }

    this.mockModule = mockModule;

    function filterSensitiveInformation(event, context) {
      event.body = JSON.parse(event.body)
      if (event.body.creditCard) event.body.creditCard.number = '****************';
      if (event.body.creditCard) event.body.creditCard.cvv = '***';

      return {event, context}
    }
  });

  it('lib exports serverless', function () {
    expect(serverlessTransmission).to.be.a('function');
  });

  it('wraps exports with transmission function', function () {
    expect(this.mockModule.exports).to.be.an('object')
  });
  it('executes a lambda function with logger', function () {

    this.mockModule.exports.someEvent(eventFixture, contextFixture, NOOP)
  })
});