const defaultsDeep = require('lodash.defaultsdeep');
const cloneDeep = require('lodash.clonedeep');
const setupTransmission = require('./lib');

const defaultConfig = {
  proxyObj: module.parent,
  proxyKey: "exports",
  presets: [],
  modifiers: [],
}

const getCustomContext = logger => {
  try {
    const context = logger.external.sentry.context;
    if(typeof context !== "function") {
      throw new Error("Context must be a function");
    }
    return context;
  } catch(err) {
    return () => {}
  }
}

const setupServerless = function(userConfig) {
  const {
    logger,
    proxyObj,
    proxyKey,
    presets,
    modifiers,
  } = defaultsDeep(userConfig, defaultConfig);

  const sentryContext = getCustomContext(logger);
  const loggerInstance = setupTransmission(logger);
  const presetsMiddlewares = presets.map(preset => require(`./lib/presets/${preset}`));

  proxyObj[proxyKey] = new Proxy(proxyObj[proxyKey], {
    get(target, propKey) {
      const origMethod = target[propKey];

      return function (event, context, callback) {
        try {
          const loggerEvent = cloneDeep(event);
          const loggerContext = cloneDeep(context);

          modifiers.forEach(modifier => modifier(loggerEvent, loggerContext));

          presetsMiddlewares.forEach(presetMiddleware => {
            presetMiddleware(loggerInstance, loggerEvent, loggerContext, sentryContext);
          });

          return origMethod(event, context, callback)
        } catch (err) {
          loggerInstance.error(err);
          callback(err);
        }
      };
    }
  });

  return loggerInstance
}

module.exports = setupServerless
