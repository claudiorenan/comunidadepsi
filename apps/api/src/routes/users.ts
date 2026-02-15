/**
 * Users routes - Compatible with CadeMeuPsi API
 */
import { Router, Request, Response } from 'express'
import { getPrismaClient } from '../services/prisma.js'
import { logger } from '../utils/logger.js'

const router = Router()

// Helper to format user response
function formatUserResponse(user: any) {
  const { password, ...userData } = user
  return userData
}

// GET /users/{id} - Get user profile by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const prisma = getPrismaClient()

    const user = await prisma.user.findUnique({
      where: { id }
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
    logger.error('Get user error:', error instanceof Error ? error.message : String(error))
    res.status(500).json({
      error: 'Erro ao buscar usuário',
      code: 'USER_ERROR',
      statusCode: 500
    })
  }
})

// GET /users - List users (public profiles)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', search } = req.query
    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20))
    const skip = (pageNum - 1) * limitNum

    const prisma = getPrismaClient()

    let where: any = {}
    if (search) {
      where = {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { specialty: { contains: search as string, mode: 'insensitive' } }
        ]
      }
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
        introduction: true,
        instagram: true,
        specialty: true,
        crp: true,
        approach: true,
        uf: true,
        city: true,
        createdAt: true
      }
    })

    const total = await prisma.user.count({ where })

    res.json({
      items: users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (error) {
    logger.error('List users error:', error instanceof Error ? error.message : String(error))
    res.status(500).json({
      error: 'Erro ao listar usuários',
      code: 'LIST_ERROR',
      statusCode: 500
    })
  }
})

export default router
