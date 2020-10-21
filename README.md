# Pino logger for GCP

Official documentation can be found [here](https://github.com/pinojs/pino/blob/master/docs/help.md#mapping-pino-log-levels-to-google-cloud-logging-stackdriver-serverity-levels).

### Usage

```
npm install pino-gcp-logger
```

> If you use Typescript install `@types/pino` as well.

```ts
import { createLogger, logLevel } from 'pino-gcp-logger';

const defaultLevel: logLevel = 'info';
const logger = createLogger('info', isGCP);
logger.info('Hello world', { extra: 'data' });
```
