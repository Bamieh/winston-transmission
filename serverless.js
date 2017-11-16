const _ = require('lodash');
const setupTransmission = require('./lib');

const defaultConfig = {
  logger,
  proxyObj: module.parent,
  proxyKey: "exports",
  presets: [],
  modifiers: [],
  customContext: {},
}

const setupServerless = function(userConfig) {
  const {
    logger,
    proxyObj,
    proxyKey,
    presets,
    modifiers,
    customContext,
  } = _.defaultsDeep(defaultConfig, userConfig);

  const loggerInstance = setupTransmission(logger);
  const presetsMiddlewares = presets.map(preset => require(`./presets/${preset}`));


  proxyObj[proxyKey] = new Proxy(proxyObj[proxyKey], {
      get(target, propKey, receiver) {
          const origMethod = target[propKey];

          return function (event, context, callback) {
            try {
              const loggerEvent = _.cloneDeep(event);
              const loggerContext = _.cloneDeep(context);

              modifiers.forEach(modifier => modifier(loggerEvent, loggerContext));

              presetsMiddlewares.forEach(presetMiddleware => {
                presetMiddleware(loggerInstance, loggerEvent, loggerContext, customContext);
              });

              return origMethod(event, context, callback)
            } catch (err) {
              loggerInstance.error(err);
              throw err;
            }

        };
      }
  });

  return loggerInstance
}

module.exports = setupServerless