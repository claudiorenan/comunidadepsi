/**
 * Content Safety Check Middleware
 * Scans content for sensitive data before POST/PATCH operations
 */
import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.js'
import { getContentSafetyScanner } from '../services/contentSafety.js'
import { logger } from '../utils/logger.js'
import { RiskLevel } from 'shared/types'

export interface SafetyRequest extends AuthRequest {
  contentSafetyResult?: any
}

export const contentSafetyCheckMiddleware = (
  req: SafetyRequest,
  res: Response,
  next: NextFunction
): void => {
  // Only check POST and PATCH with content/title
  if (!['POST', 'PATCH'].includes(req.method)) {
    next()
    return
  }

  const { title, content } = req.body

  if (!title && !content) {
    next()
    return
  }

  try {
    const scanner = getContentSafetyScanner()

    // Scan title if exists
    let result = title ? scanner.scanContent(title) : null

    // Scan content and merge with title results
    if (content) {
      const contentResult = scanner.scanContent(content)

      if (result) {
        // Merge results
        result.score += contentResult.score
        result.flags.push(...contentResult.flags)
        result.suggestions = [...new Set([...result.suggestions, ...contentResult.suggestions])]

        // Re-determine risk level
        const highThreshold = parseInt(process.env.CONTENT_SAFETY_RISK_THRESHOLD_HIGH || '80')
        const mediumThreshold = parseInt(process.env.CONTENT_SAFETY_RISK_THRESHOLD_MEDIUM || '50')

        if (result.score >= highThreshold) result.riskLevel = RiskLevel.HIGH
        else if (result.score >= mediumThreshold) result.riskLevel = RiskLevel.MEDIUM
        else result.riskLevel = RiskLevel.LOW
      } else {
        result = contentResult
      }
    }

    // Attach result to request
    req.contentSafetyResult = result

    // Check if should block
    const shouldBlock =
      process.env.CONTENT_SAFETY_ENABLED === 'true' &&
      process.env.CONTENT_SAFETY_BLOCK_HIGH_RISK === 'true' &&
      result?.riskLevel === RiskLevel.HIGH

    if (shouldBlock) {
      logger.warn(`Content blocked due to high risk level: ${JSON.stringify(result)}`)
      res.status(400).json({
        error: 'Seu conteúdo contém informações sensíveis que não podem ser compartilhadas',
        code: 'CONTENT_SAFETY_BLOCK',
        statusCode: 400,
        details: {
          riskLevel: result?.riskLevel,
          score: result?.score,
          suggestions: result?.suggestions
        }
      })
      return
    }

    next()
  } catch (error) {
    logger.error('Content safety check error:', error)
    // Don't block on error, just log it
    next()
  }
}
