import _ from 'lodash';

function handleModules(exports, {logger, presets = [], modifiers = [], customContext = {}}) {
  const catchErrors = function (fn) {
    return function (event, context, callback) {
      const presetsMiddlewares = presets.map(preset => require(`./presets/${preset}`));

      try {
        const loggerEvent = _.cloneDeep(event);
        const loggerContext = _.cloneDeep(context);

        modifiers.forEach(modifier => modifier(loggerEvent, loggerContext));

        presetsMiddlewares.forEach(presetMiddleware => {
          presetMiddleware.default(logger, loggerEvent, loggerContext, customContext);
        });

        fn(event, context, callback);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  };

  Object.keys(exports).forEach(key => {
    exports[key] = catchErrors(exports[key]);
  });

  return exports;
}

export default handleModules
