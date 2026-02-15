/**
 * Comments routes
 */
import { Router, Request, Response } from 'express'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'
import { getPrismaClient } from '../services/prisma.js'
import { logger } from '../utils/logger.js'
import { UserRole } from 'shared/types'

const router = Router()

// GET /posts/:postId/comments - List comments for a post
router.get('/posts/:postId/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params
    const { page = '1', limit = '10' } = req.query
    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10))
    const skip = (pageNum - 1) * limitNum

    const prisma = getPrismaClient()

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    })

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    // Get comments
    const items = await prisma.comment.findMany({
      where: {
        postId,
        status: 'published'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            photo: true,
            crp: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    })

    const total = await prisma.comment.count({
      where: {
        postId,
        status: 'published'
      }
    })

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (error) {
    logger.error('Error fetching comments:', error)
    res.status(500).json({
      error: 'Failed to fetch comments',
      code: 'COMMENTS_FETCH_ERROR',
      statusCode: 500
    })
  }
})

// POST /posts/:postId/comments - Create comment
router.post('/posts/:postId/comments', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params
    const { content } = req.body

    if (!content) {
      res.status(400).json({
        error: 'Missing required field: content',
        code: 'MISSING_CONTENT',
        statusCode: 400
      })
      return
    }

    const prisma = getPrismaClient()

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    })

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: req.user!.userId,
        content,
        status: 'published'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            photo: true,
            crp: true
          }
        }
      }
    })

    res.status(201).json(comment)
  } catch (error) {
    logger.error('Error creating comment:', error)
    res.status(500).json({
      error: 'Failed to create comment',
      code: 'COMMENT_CREATE_ERROR',
      statusCode: 500
    })
  }
})

// PATCH /comments/:id - Update comment (author only)
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { content } = req.body

    if (!content) {
      res.status(400).json({
        error: 'Missing required field: content',
        code: 'MISSING_CONTENT',
        statusCode: 400
      })
      return
    }

    const prisma = getPrismaClient()

    // Check if comment exists and user is author
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!comment) {
      res.status(404).json({
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    if (comment.authorId !== req.user!.userId) {
      res.status(403).json({
        error: 'You can only edit your own comments',
        code: 'FORBIDDEN',
        statusCode: 403
      })
      return
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            photo: true,
            crp: true
          }
        }
      }
    })

    res.json(updatedComment)
  } catch (error) {
    logger.error('Error updating comment:', error)
    res.status(500).json({
      error: 'Failed to update comment',
      code: 'COMMENT_UPDATE_ERROR',
      statusCode: 500
    })
  }
})

// DELETE /comments/:id - Delete comment (author or admin)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const prisma = getPrismaClient()

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!comment) {
      res.status(404).json({
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    // Check authorization
    const isAuthor = comment.authorId === req.user!.userId
    const isAdmin = req.user!.role === UserRole.ADMIN

    if (!isAuthor && !isAdmin) {
      res.status(403).json({
        error: 'You can only delete your own comments',
        code: 'FORBIDDEN',
        statusCode: 403
      })
      return
    }

    await prisma.comment.delete({
      where: { id }
    })

    res.json({
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting comment:', error)
    res.status(500).json({
      error: 'Failed to delete comment',
      code: 'COMMENT_DELETE_ERROR',
      statusCode: 500
    })
  }
})

export default router
