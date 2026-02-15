/**
 * Authentication routes
 */
import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'
import { getExternalApiClient } from '../services/externalApi.js'
import { getPrismaClient } from '../services/prisma.js'
import { logger } from '../utils/logger.js'
import { AppError, UserRole } from 'shared/types'

const router = Router()

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body

    if (!code) {
      res.status(400).json({
        error: 'Missing authorization code',
        code: 'MISSING_CODE',
        statusCode: 400
      })
      return
    }

    const externalApi = getExternalApiClient()
    const prisma = getPrismaClient()

    // Exchange code for external API token
    const oauthToken = await externalApi.exchangeAuthorizationCode(code)
    logger.info('OAuth token obtained')

    // Get psychologist profile from external API
    const externalProfile = await externalApi.getPsychologistProfile(oauthToken.accessToken)
    logger.info(`Fetched profile for external ID: ${externalProfile.id}`)

    // Sync or create user in database
    let user = await prisma.user.findUnique({
      where: { externalId: externalProfile.id }
    })

    if (!user) {
      logger.info(`Creating new user: ${externalProfile.id}`)
      user = await prisma.user.create({
        data: {
          externalId: externalProfile.id,
          name: externalProfile.name,
          crp: externalProfile.crp,
          approach: externalProfile.approach,
          uf: externalProfile.uf,
          city: externalProfile.city,
          photoUrl: externalProfile.photoUrl,
          bio: externalProfile.bio,
          role: UserRole.PSYCHOLOGIST
        }
      })
    } else {
      logger.info(`Updating existing user: ${externalProfile.id}`)
      // Update user data if changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: externalProfile.name,
          approach: externalProfile.approach,
          city: externalProfile.city,
          photoUrl: externalProfile.photoUrl,
          bio: externalProfile.bio
        }
      })
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        externalId: user.externalId,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
    )

    // Set secure cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })

    res.json({
      user: {
        id: user.id,
        externalId: user.externalId,
        name: user.name,
        crp: user.crp,
        approach: user.approach,
        uf: user.uf,
        city: user.city,
        photoUrl: user.photoUrl,
        bio: user.bio,
        role: user.role
      },
      accessToken,
      refreshToken
    })
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
        statusCode: error.statusCode
      })
      return
    }

    logger.error('Login error:', error)
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      statusCode: 500
    })
  }
})

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({
        error: 'Missing refresh token',
        code: 'MISSING_REFRESH_TOKEN',
        statusCode: 400
      })
      return
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any
    const prisma = getPrismaClient()

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 401
      })
      return
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        externalId: user.externalId,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    )

    res.json({
      accessToken: newAccessToken
    })
  } catch (error) {
    logger.error('Token refresh error:', error)
    res.status(401).json({
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN',
      statusCode: 401
    })
  }
})

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prisma = getPrismaClient()
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId }
    })

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    res.json({
      user: {
        id: user.id,
        externalId: user.externalId,
        name: user.name,
        crp: user.crp,
        approach: user.approach,
        uf: user.uf,
        city: user.city,
        photoUrl: user.photoUrl,
        bio: user.bio,
        role: user.role
      }
    })
  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({
      error: 'Failed to fetch profile',
      code: 'PROFILE_FETCH_ERROR',
      statusCode: 500
    })
  }
})

// POST /auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('accessToken')
  res.json({
    message: 'Logged out successfully'
  })
})

export default router
