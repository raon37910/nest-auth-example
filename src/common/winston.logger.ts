import { LoggerService as NestLoggerService } from '@nestjs/common'

import * as winston from 'winston'
import * as moment from 'moment'
import { utilities } from 'nest-winston'

const { errors, combine, timestamp, printf } = winston.format

export class LoggerService implements NestLoggerService {
  private logger: winston.Logger

  constructor(service: string) {
    this.logger = winston.createLogger({
      transports: [
        winstonConsoleTransportGenerator(service),
        winstonErrorFileTransportGenerator(),
        winstonFileTransportGenerator(),
      ],
    })
  }

  log(message: string) {
    this.logger.log({ level: 'info', message })
  }

  error(message: string) {
    this.logger.log({ level: 'error', message })
  }

  warn(message: string) {
    this.logger.log({ level: 'warn', message })
  }

  debug?(message: string) {
    this.logger.log({ level: 'debug', message })
  }

  verbose?(message: string) {
    this.logger.log({ level: 'verbose', message })
  }
}

/**
 *  ==================================
 *    Logger Transport Generator
 *  ==================================
 */
const winstonConsoleTransportGenerator = (service: string) =>
  new winston.transports.Console({
    level: 'debug',
    format: combine(
      timestamp({ format: 'isoDateTime' }),
      utilities.format.nestLike(service, {
        prettyPrint: true,
      }),
    ),
  })

const winstonErrorFileTransportGenerator = () =>
  new winston.transports.File({
    level: 'error',
    filename: `error-${moment(new Date()).format('YYYY-MM-DD')}.log`,
    dirname: 'logs',
    maxsize: 5000000,
    format: combine(
      errors({ stack: true }),
      timestamp({ format: 'isoDateTime' }),
      printf((info) => {
        return `${info.message}`
      }),
    ),
  })

const winstonFileTransportGenerator = () =>
  new winston.transports.File({
    filename: `application-${moment(new Date()).format('YYYY-MM-DD')}.log`,
    dirname: 'logs',
    maxsize: 5000000,
    format: combine(
      timestamp({ format: 'isoDateTime' }),
      printf((info) => {
        return `${info.message}`
      }),
    ),
  })
