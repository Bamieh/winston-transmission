const isNil = require('lodash.isnil');

function awsLambdaPreset(logger, event, context, customContext = {}) {
  const sentryLogger = logger.transports.find(transport => transport.name ==='sentryLogger');

  if (sentryLogger) {
    sentryLogger.raven.setContext({})

    addUserContext(sentryLogger, event, context)
    addTagsContext(sentryLogger, event, context)
    addExtraContext(sentryLogger, event, context)
    addBreadcrumbs(sentryLogger, event)

    sentryLogger.raven.mergeContext(customContext)
  }
}

function addUserContext(logger, event, context) {
  // Depending on the endpoint type the identity information can be at
  // event.requestContext.identity (AWS_PROXY) or at context.identity (AWS)
  const identity =
    !isNil(context.identity) ? context.identity : ( !isNil(event.requestContext) ? event.requestContext.identity : null);

  if (!isNil(identity)) {
    logger.raven.mergeContext({
      user: {
        id: identity.cognitoIdentityId || undefined,
        username: identity.user || undefined,
        ip_address: identity.sourceIp || undefined,
        cognito_identity_pool_id: identity.cognitoIdentityPoolId,
        cognito_authentication_type: identity.cognitoAuthenticationType,
        user_agent: identity.userAgent
      }
    })
  }
}

function addTagsContext(logger, event, context) {
  // Add additional tags for AWS_PROXY endpoints
  if (!isNil(event.requestContext)) {
    logger.raven.mergeContext({
      tags: {
        api_id: event.requestContext.apiId,
        api_stage: event.requestContext.stage,
        http_method: event.requestContext.httpMethod,
        lambda: context.functionName,
        version: context.functionVersion,
        memory_size: context.memoryLimitInMB,
        log_group: context.logGroupName,
        log_stream: context.logStreamName,
        service_name: process.env.SERVERLESS_SERVICE,
        stage: process.env.SERVERLESS_STAGE,
        alias: process.env.SERVERLESS_ALIAS,
        region: process.env.SERVERLESS_REGION || process.env.AWS_REGION
      }
    })
  }
};

function addBreadcrumbs(logger, event) {
  // First breadcrumb is the invocation of the Lambda itself
  const breadcrumb = {
    message: process.env.AWS_LAMBDA_FUNCTION_NAME,
    category: "lambda",
    level: "info",
    data: {}
  };

  if (event.requestContext) {
    // Track HTTP request info as part of the breadcrumb
    Object.assign(breadcrumb.data, {
      http_method: event.requestContext && event.requestContext.httpMethod,
      host: event.headers && event.headers.Host,
      path: event.path,
      user_agent: event.headers && event.headers["User-Agent"]
    });
  }

  logger.raven.captureBreadcrumb(breadcrumb);
};

function addExtraContext(logger, event, context) {
  logger.raven.mergeContext({
    extra: {
      Event: event,
      Context: context
    }
  })
};

module.exports = awsLambdaPreset