function handleModules(modules) {
  const catchErrors = function(fn) {
    return function(event, context, callback) {
      try {

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