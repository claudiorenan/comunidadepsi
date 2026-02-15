/**
 * Authentication routes - Compatible with CadeMeuPsi API
 */
import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { config } from '../config/env.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'
import { getPrismaClient } from '../services/prisma.js'
import { logger } from '../utils/logger.js'

const router = Router()

// Helper to format user response
function formatUserResponse(user: any) {
  const { password, ...userData } = user
  return userData
}

// POST /auth/login - Email + Password authentication
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, device_name } = req.body
    logger.info(`Login attempt: ${email} from ${device_name || 'unknown device'}`)

    if (!email || !password) {
      res.status(400).json({
        error: 'Email e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS',
        statusCode: 400
      })
      return
    }

    const prisma = getPrismaClient()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      logger.warn(`Login failed: user not found ${email}`)
      res.status(401).json({
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401
      })
      return
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      logger.warn(`Login failed: invalid password for ${email}`)
      res.status(401).json({
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401
      })
      return
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    )

    logger.info(`Login successful: ${email}`)

    // Return token + user data (compatible with CadeMeuPsi format)
    res.json({
      token,
      user: formatUserResponse(user)
    })
  } catch (error) {
    logger.error('Login error:', error instanceof Error ? error.message : String(error))
    res.status(500).json({
      error: 'Erro ao fazer login',
      code: 'LOGIN_ERROR',
      statusCode: 500
    })
  }
})

// GET /auth/me - Get authenticated user profile
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prisma = getPrismaClient()

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    })

    if (!user) {
      res.status(404).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    res.json(formatUserResponse(user))
  } catch (error) {
    logger.error('Get profile error:', error instanceof Error ? error.message : String(error))
    res.status(500).json({
      error: 'Erro ao buscar perfil',
      code: 'PROFILE_ERROR',
      statusCode: 500
    })
  }
})

// POST /auth/logout - Logout (stateless, just acknowledge)
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    logger.info(`Logout: ${req.user!.userId}`)
    res.json({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    logger.error('Logout error:', error instanceof Error ? error.message : String(error))
    res.status(500).json({
      error: 'Erro ao fazer logout',
      code: 'LOGOUT_ERROR',
      statusCode: 500
    })
  }
})

// POST /auth/refresh - Refresh token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({
        error: 'Refresh token é obrigatório',
        code: 'MISSING_REFRESH_TOKEN',
        statusCode: 400
      })
      return
    }

    try {
      const decoded: any = jwt.verify(refreshToken, config.jwt.refreshSecret)
      const prisma = getPrismaClient()

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        res.status(401).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
          statusCode: 401
        })
        return
      }

      const newToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      )

      res.json({
        token: newToken,
        user: formatUserResponse(user)
      })
    } catch (e) {
      res.status(401).json({
        error: 'Refresh token inválido',
        code: 'INVALID_REFRESH_TOKEN',
        statusCode: 401
      })
    }
  } catch (error) {
    logger.error('Refresh error:', error instanceof Error ? error.message : String(error))
    res.status(500).json({
      error: 'Erro ao renovar token',
      code: 'REFRESH_ERROR',
      statusCode: 500
    })
  }
})

export default router
