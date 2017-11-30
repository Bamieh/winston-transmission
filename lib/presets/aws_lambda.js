const isNil = require('lodash.isnil');
const defaultsDeep = require('lodash.defaultsdeep');

function awsLambdaPreset(logger, event, context, customContext) {
  const sentryLogger = logger.transports.find(transport => transport.name === 'sentryLogger');

  if (sentryLogger) {
    sentryLogger.raven.setContext({});

    addBreadcrumbs(sentryLogger, event);

    const sentryContext = defaultsDeep(customContext(event, context), {
      user: addUserContext(event, context),
      tags: addTagsContext(event, context),
      extra: addExtraContext(event, context),
    });

    sentryLogger.raven.mergeContext(sentryContext);
  }
}

function addUserContext(event, context) {
  // Depending on the endpoint type the identity information can be at
  // event.requestContext.identity (AWS_PROXY) or at context.identity (AWS)
  event.headers = event.headers || {};
  const identity =
    !isNil(context.identity) ? context.identity : ( !isNil(event.requestContext) ? event.requestContext.identity : null);


  const forwardedIps = event.headers['X-Forwarded-For']
  let userContext = {
    ip_address: forwardedIps && forwardedIps.split(",").shift(),
    user_agent: event.headers['User-Agent'],
  }

  if (!isNil(identity)) {
    userContext = defaultsDeep(userContext, {
      id: identity.cognitoIdentityId,
      username: identity.user,
      ip_address: identity.sourceIp,
      user_agent: identity.userAgent,
    });
  }

  return userContext
}

function addTagsContext(event, context) {
  // Add additional tags for AWS_PROXY endpoints
  if (!isNil(event.requestContext)) {
    return {
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
      region: process.env.SERVERLESS_REGION || process.env.AWS_REGION,
    }
  }
};

function addBreadcrumbs(logger, event) {
  // First breadcrumb is the invocation of the Lambda itself
  const breadcrumb = {
    message: process.env.AWS_LAMBDA_FUNCTION_NAME,
    category: "lambda",
    level: "info",
    data: {},
  };

  if (event.requestContext) {
    // Track HTTP request info as part of the breadcrumb
    Object.assign(breadcrumb.data, {
      http_method: event.requestContext && event.requestContext.httpMethod,
      host: event.headers && event.headers.Host,
      path: event.path,
      user_agent: event.headers && event.headers["User-Agent"],
    });
  }

  logger.raven.captureBreadcrumb(breadcrumb);
};

function addExtraContext(event, context) {
  return {
    Event: event,
    Context: context,
  }
};

module.exports = awsLambdaPreset