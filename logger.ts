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
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM',
      },
    },
    base: null,
    hooks: {
      logMethod(inputArgs, method) {
        if (inputArgs.length >= 2) {
          const arg1 = inputArgs.shift();
          const arg2 = inputArgs.shift();
          return method.apply(this, [arg2, arg1, ...inputArgs]);
        }
        return method.apply(this, [inputArgs[0]]);
      },
    },
  };

  const productionPinoConfig: LoggerOptions = {
    level,
    messageKey: 'message',
    base: null,
    hooks: {
      logMethod(inputArgs, method) {
        if (inputArgs.length >= 2) {
          const arg1 = inputArgs.shift();
          const arg2 = inputArgs.shift();
          return method.apply(this, [arg2, arg1, ...inputArgs]);
        }
        return method.apply(this, [inputArgs[0]]);
      },
    },
    formatters: {
      level(label: string, number: number) {
        const pinoLevel = label as logLevel;
        const severity = PinoLevelToSeverityLookup[pinoLevel] || PinoLevelToSeverityLookup['info'];

        const typeProp =
          pinoLevel === 'error' || pinoLevel === 'fatal'
            ? {
                '@type': 'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent',
              }
            : {};
        return {
          severity,
          ...typeProp,
        };
      },
      log(object) {
        const logObject = object as { err?: Error };
        const stackProp = logObject?.err?.stack ? { stack_trace: logObject.err.stack } : {};
        return { ...object, ...stackProp };
      },
    },
    timestamp: () => `,"eventTime":${Date.now() / 1000.0}`,
  };

  let config: LoggerOptions = isGCP ? productionPinoConfig : devPinoConfig;

  return pino(Object.assign({}, config, customConfig));
}
