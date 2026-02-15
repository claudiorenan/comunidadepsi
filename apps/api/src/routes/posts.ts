/**
 * Posts routes
 */
import { Router, Response } from 'express'
import { AuthRequest, authMiddleware, optionalAuth } from '../middleware/auth.js'
import { SafetyRequest } from '../middleware/contentSafetyCheck.js'
import { getPrismaClient } from '../services/prisma.js'
import { logger } from '../utils/logger.js'
import { UserRole, PostStatus, PostType } from 'shared/types'

const router = Router()

// GET /posts - List posts with pagination and filters
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', type, status = 'published', search, tags } = req.query
    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10))
    const skip = (pageNum - 1) * limitNum

    const prisma = getPrismaClient()

    // Build filter
    const where: any = {}

    if (status) {
      where.status = status === 'published' ? PostStatus.PUBLISHED : status
    }

    if (type && Object.values(PostType).includes(type as PostType)) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      where.tags = { hasSome: tagArray }
    }

    // Get posts with author
    const items = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            crp: true,
            photoUrl: true,
            approach: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    })

    // Get total count
    const total = await prisma.post.count({ where })

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (error) {
    logger.error('Error fetching posts:', error)
    res.status(500).json({
      error: 'Failed to fetch posts',
      code: 'POSTS_FETCH_ERROR',
      statusCode: 500
    })
  }
})

// POST /posts - Create new post
router.post('/', authMiddleware, async (req: SafetyRequest, res: Response): Promise<void> => {
  try {
    const { type, title, content, tags } = req.body

    // Validate required fields
    if (!type || !title || !content) {
      res.status(400).json({
        error: 'Missing required fields: type, title, content',
        code: 'MISSING_FIELDS',
        statusCode: 400
      })
      return
    }

    // Validate type
    if (!Object.values(PostType).includes(type)) {
      res.status(400).json({
        error: `Invalid type. Must be one of: ${Object.values(PostType).join(', ')}`,
        code: 'INVALID_TYPE',
        statusCode: 400
      })
      return
    }

    const prisma = getPrismaClient()

    const post = await prisma.post.create({
      data: {
        authorId: req.user!.userId,
        type,
        title,
        content,
        tags: tags || [],
        status: PostStatus.PUBLISHED
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            crp: true,
            photoUrl: true,
            approach: true
          }
        }
      }
    })

    const response: any = { data: post }
    if (req.contentSafetyResult) {
      response.contentSafetyWarning = req.contentSafetyResult
    }

    res.status(201).json(response)
  } catch (error) {
    logger.error('Error creating post:', error)
    res.status(500).json({
      error: 'Failed to create post',
      code: 'POST_CREATE_ERROR',
      statusCode: 500
    })
  }
})

// GET /posts/:id - Get post detail with comments
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const prisma = getPrismaClient()

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            crp: true,
            photoUrl: true,
            approach: true,
            uf: true
          }
        },
        comments: {
          where: { status: 'published' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                photoUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    res.json(post)
  } catch (error) {
    logger.error('Error fetching post:', error)
    res.status(500).json({
      error: 'Failed to fetch post',
      code: 'POST_FETCH_ERROR',
      statusCode: 500
    })
  }
})

// PATCH /posts/:id - Update post (author only)
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, content, tags } = req.body
    const prisma = getPrismaClient()

    // Check if post exists and user is author
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    if (post.authorId !== req.user!.userId) {
      res.status(403).json({
        error: 'You can only edit your own posts',
        code: 'FORBIDDEN',
        statusCode: 403
      })
      return
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        tags: tags !== undefined ? tags : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            crp: true,
            photoUrl: true,
            approach: true
          }
        }
      }
    })

    res.json(updatedPost)
  } catch (error) {
    logger.error('Error updating post:', error)
    res.status(500).json({
      error: 'Failed to update post',
      code: 'POST_UPDATE_ERROR',
      statusCode: 500
    })
  }
})

// DELETE /posts/:id - Delete post (author or admin)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const prisma = getPrismaClient()

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    // Check authorization
    const isAuthor = post.authorId === req.user!.userId
    const isAdmin = req.user!.role === UserRole.ADMIN

    if (!isAuthor && !isAdmin) {
      res.status(403).json({
        error: 'You can only delete your own posts',
        code: 'FORBIDDEN',
        statusCode: 403
      })
      return
    }

    await prisma.post.delete({
      where: { id }
    })

    res.json({
      message: 'Post deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting post:', error)
    res.status(500).json({
      error: 'Failed to delete post',
      code: 'POST_DELETE_ERROR',
      statusCode: 500
    })
  }
})

export default router
