/**
 * Authentication middleware
 */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { AppError, UserRole } from 'shared/types'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    role: UserRole
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      throw new AppError(401, 'Missing authentication token', 'MISSING_TOKEN')
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }

    next()
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
        statusCode: error.statusCode
      })
      return
    }

    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      statusCode: 401
    })
  }
}

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '')

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as any
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    }

    next()
  } catch {
    // Silently continue without user
    next()
  }
}
