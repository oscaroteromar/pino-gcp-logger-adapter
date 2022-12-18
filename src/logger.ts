import pino, { Logger, LoggerOptions } from 'pino'

enum PinoLevelToSeverityLookup {
  silent = 'OFF',
  trace = 'DEBUG',
  debug = 'DEBUG',
  info = 'INFO',
  warn = 'WARNING',
  error = 'ERROR',
  fatal = 'CRITICAL',
}

export type logLevel = keyof typeof PinoLevelToSeverityLookup

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
  }

  const productionPinoConfig: LoggerOptions = {
    level,
    messageKey: 'message',
    base: null,
    formatters: {
      level(label: string, number: number) {
        const pinoLevel = label as logLevel
        const severity = PinoLevelToSeverityLookup[pinoLevel] || PinoLevelToSeverityLookup.info

        const typeProp = [PinoLevelToSeverityLookup.error, PinoLevelToSeverityLookup.fatal].includes(severity)
          ? {
              '@type': 'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent',
            }
          : {}

        return { severity, ...typeProp }
      },
      log(object) {
        const logObject = object as { err?: Error }
        const stackProp = logObject?.err?.stack ? { stack_trace: logObject.err.stack } : {}

        return { ...object, ...stackProp }
      },
    },
    timestamp: () => `,"eventTime":${Date.now() / 1000.0}`,
  }

  const config = isGCP ? productionPinoConfig : devPinoConfig

  return pino(Object.assign({}, config, customConfig))
}
