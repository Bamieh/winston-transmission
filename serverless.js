const defaultsDeep = require('lodash.defaultsdeep');
const cloneDeep = require('lodash.clonedeep');
const setupTransmission = require('./lib');

const defaultConfig = {
  proxyObj: module.parent,
  proxyKey: "exports",
  presets: [],
  modifiers: [],
  customContext: {},
}

// Captures an error and waits for it to be logged in Sentry

function captureError(err, cb) {
  function onCaptured() {
    Raven.removeListener('logged', onCaptured);
    Raven.removeListener('error', onCaptured);
    return cb();
  }

  Raven.on('logged', onCaptured);
  Raven.on('error', onCaptured);
  if (err instanceof Error) {
    Raven.captureException(err);
  } else {
    Raven.captureMessage(err, { level: 'error' });
  }
}

// // Captures an error and waits for it to be logged in Sentry
//   function captureError(err, cb) {
//     function onCaptured() {
//       Raven.removeListener('logged', onCaptured);
//       Raven.removeListener('error', onCaptured);
//       return cb();
//     }

//     Raven.on('logged', onCaptured);
//     Raven.on('error', onCaptured);
//     if (err instanceof Error) {
//       Raven.captureException(err);
//     } else {
//       Raven.captureMessage(err, { level: 'error' });
//     }
//   }

const setupServerless = function(userConfig) {
  const {
    logger,
    proxyObj,
    proxyKey,
    presets,
    modifiers,
    customContext,
  } = defaultsDeep(defaultConfig, userConfig);

  const loggerInstance = setupTransmission(logger);
  const presetsMiddlewares = presets.map(preset => require(`./lib/presets/${preset}`));


  proxyObj[proxyKey] = new Proxy(proxyObj[proxyKey], {
      get(target, propKey, receiver) {
          const origMethod = target[propKey];

          return function (event, context, callback) {
            try {
              const loggerEvent = cloneDeep(event);
              const loggerContext = cloneDeep(context);

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
