import winstonTransmission from '../';

function handleModules(modules, config) {
  const catchErrors = function(fn) {
    return function(event, context, callback) {
      try {
        config.extraLoggingContext(event, context);
        fn(event, context, callback);
      } catch(err) {
        console.log('caught er:', err);
      }
    }
 }

 Object.keys(modules).forEach(key => {
   modules[key] = catchErrors(modules[key]);
 });

 return modules;
}
export default handleModules