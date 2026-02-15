/**
 * Request validation middleware using Zod
 */
import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { AppError } from 'shared/types'

export const validateRequest = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params

      const validation = schema.safeParse(data)

      if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors
        throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors)
      }

      if (source === 'body') {
        req.body = validation.data
      } else if (source === 'query') {
        req.query = validation.data
      } else {
        req.params = validation.data
      }

      next()
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
          details: error.details,
          statusCode: error.statusCode
        })
        return
      }

      res.status(500).json({
        error: 'Internal validation error',
        code: 'VALIDATION_ERROR',
        statusCode: 500
      })
    }
  }
}
