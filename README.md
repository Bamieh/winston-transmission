# Rocket Transmission

A Custom NodeJS [Winston](https://github.com/winstonjs/winston) Logger, used by Rocket


## using The transmission Logger

## npm log-levels Assumption

Rocket Transmission assumes npm log-levels, and bases its logging upon it.

Each level is given a specific integer priority. The higher the priority the more important the message is considered to be, and the lower the corresponding integer priority. For example, npm logging levels are prioritized from 0 to 5 (highest to lowest):

```
{
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
}
```


## Default Configurations

```
{
  level: 'info',
  colorize: true,
  timestamp: true,
  prettyPrint: false,
  prefix: "",
}
```