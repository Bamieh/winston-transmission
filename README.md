# Winston Transmission
[![npm version](https://badge.fury.io/js/winston-transmission.svg)](https://badge.fury.io/js/winston-transmission)


A Custom Logger build on top of [Winston](https://github.com/winstonjs/winston).

- [x] Console
- [x] Sentry
- [x] Papertrail
- [x] Rollbar
- [x] Bugsnag
- [ ] Isomorphic using raven-js raven-node

```
npm install winston-transmission
```

## Usage and Configs
To use winston as is, install this dependency in your project:
### Basic
The basic configurations only reports to the console, the default logging level is `info`.

```
import winstonTransmission from 'winston-transmission';

global.winston = winstonTransmission({
  logLevel: 'info',
})
```

### Sentry
To use sentry, install this dependency in your project:

```
npm install raven
```

#### Usage
```
import winstonTransmission from 'winston-transmission';

global.winston = winstonTransmission({
  logLevel: 'info',
  processName: 'My Awesome App',
  externalLogging: {
    logLevel: 'warn',
    sentry: 'SENTRY-KEY-XXXX',
  },
})
```

### Rollbar
To use Rollbar, install this dependency in your project:
```
npm install rollbar
```

#### Usage
```
import winstonTransmission from 'winston-transmission';

global.winston = winstonTransmission({
  logLevel: 'info',
  processName: 'My Awesome App',
  externalLogging: {
    logLevel: 'warn',
    rollbar: 'ROLLBAR-KEY-XXXX',
  },
})
```
### PaperTrail
To use Rollbar, install this dependency in your project:
```
npm install winston-papertrail
```

#### Usage
```
import winstonTransmission from 'winston-transmission';

global.winston = winstonTransmission({
  logLevel: 'info',
  processName: 'My Awesome App',
  externalLogging: {
    logLevel: 'warn',
    papertrail: {
      host: 'PAPERTRAIL HOST',
      port: 'PAPERTRAIL PORT',
      program: 'PAPERTRAIL PROGRAM',
    },
  },
})
```
### Bugsnag
To use Bugsnag, install this dependency in your project:
```
npm install bugsnag
```

#### Usage
```
import winstonTransmission from 'winston-transmission';

global.winston = winstonTransmission({
  logLevel: 'info',
  processName: 'My Awesome App',
  externalLogging: {
    logLevel: 'warn',
    bugsnag: 'BUGSNAG-KEY-XXXX',
  },
})
```


## npm log-levels Assumption

Winston Transmission assumes npm log-levels, and bases its logging upon it.

Each level is given a specific integer priority. The higher the priority the more important the message is considered to be. Ordered from highest priority to the lowest:

```
error | warn | info | verbose | debug | silly
```

