/**
 * Global error handler middleware
 */
import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'
import { AppError } from 'shared/types'

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({ err }, 'Error caught by error handler')

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
      statusCode: err.statusCode
    })
    return
  }

  const statusCode = 'statusCode' in err ? (err as any).statusCode : 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    error: message,
    code: 'INTERNAL_ERROR',
    statusCode
  })
}
