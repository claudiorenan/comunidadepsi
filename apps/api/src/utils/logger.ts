/**
 * Logger utility using pino
 */
import pino from 'pino'
import { config } from '../config/env.js'

const isDev = config.env === 'development'

export const logger = pino(
  isDev
    ? {
        level: config.logging.level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      }
    : {
        level: config.logging.level
      }
)
