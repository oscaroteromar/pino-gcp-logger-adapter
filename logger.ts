import pino, { Logger, LoggerOptions } from 'pino';

enum PinoLevelToSeverityLookup {
  silent = 'OFF',
  trace = 'DEBUG',
  debug = 'DEBUG',
  info = 'INFO',
  warn = 'WARNING',
  error = 'ERROR',
  fatal = 'CRITICAL',
}

export type logLevel = keyof typeof PinoLevelToSeverityLookup;

export function createLogger(level: logLevel, isGCP: boolean, customConfig?: LoggerOptions): Logger {
  const devPinoConfig: LoggerOptions = {
    level,
    prettyPrint: {
      colorize: true,
      translateTime: 'HH:MM',
    },
    base: null,
  };

  const productionPinoConfig: LoggerOptions = {
    level,
    prettyPrint: false,
    messageKey: 'message',
    base: null,
    formatters: {
      level(label: string, number: number) {
        return {
          severity: PinoLevelToSeverityLookup[label as logLevel] || PinoLevelToSeverityLookup['info'],
          level: number,
        };
      },
    },
  };

  let config: LoggerOptions = devPinoConfig;

  if (isGCP) {
    config = Object.assign({}, productionPinoConfig);
  }

  return pino(Object.assign({}, config, customConfig));
}
