# Pino logger for GCP

Official documentation can be found [here](https://github.com/pinojs/pino/blob/master/docs/help.md#mapping-pino-log-levels-to-google-cloud-logging-stackdriver-serverity-levels).

### Usage

```
npm install pino-gcp-logger
```

```ts
import { createLogger, logLevel } from 'pino-gcp-logger';

const defaultLevel: logLevel = 'info';
const isGCP = true;
const logger = createLogger(defaultLevel, isGCP);
logger.info('Hello world', { extra: 'data' });
```
