const TransportStream = require('winston-transport');

const { LEVEL, MESSAGE } = require('triple-beam');

function stringArrayToSet(strArray, errMsg) {
  errMsg = errMsg || 'Cannot make set from Array with non-string elements';

  return strArray.reduce(function (set, el) {
    if (typeof el !== 'string') { throw new Error(errMsg); }
    set[el] = true;
    return set;
  }, {});
}

function getStderrLevels(levels, debugStdout) {
  var defaultMsg = 'Cannot have non-string elements in stderrLevels Array';
  if (debugStdout) {
    if (levels) {
      //
      // Don't allow setting both debugStdout and stderrLevels together,
      // since this could cause behaviour a programmer might not expect.
      //
      throw new Error('Cannot set debugStdout and stderrLevels together');
    }

    return stringArrayToSet(['error'], defaultMsg);
  }

  if (!levels) {
    return stringArrayToSet(['error', 'debug'], defaultMsg);
  } else if (!(Array.isArray(levels))) {
    throw new Error('Cannot set stderrLevels to type other than Array');
  }

  return stringArrayToSet(levels, defaultMsg);
}

//
// Expose the name of this Transport on the prototype
//
class BrowserConsole extends TransportStream {
  constructor(options={}) {
    super(options);
    TransportStream.call(this, options);

    this.name = 'console';
    this.levels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 4,
    };

    this.methods = {
        error: 'error',
        warn: 'warn',
        info: 'info',
        debug: 'log',
    };

    this.stderrLevels = getStderrLevels(options.stderrLevels, options.debugStdout);

    this.level = options.level && this.levels.hasOwnProperty(options.level)
                  ? options.level : 'info';
  }
  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    // console.log(info[MESSAGE])
    const consoleMethod = this.stderrLevels[info[LEVEL]]? 'error' : 'log';

    // if (this.stderrLevels[info[LEVEL]]) {
    //   console.error(info[MESSAGE]);
    //   if (callback) { callback(); } // eslint-disable-line
    //   return;
    // }

    console.log(info[MESSAGE]);

    if (callback) { callback(); } // eslint-disable-line
  }
  // log(method, message) {
  //   // console.log('message::', message)
  //   setImmediate(() => {
  //     this.emit('logged', method);
  //   });

  //   const val = this.levels[method];
  //   const mappedMethod = this.methods[method];

  //   if (val <= this.levels[this.level]) {
  //     // eslint-disable-next-line
  //     console[mappedMethod](message);
  //   }
  // }
}

export default BrowserConsole