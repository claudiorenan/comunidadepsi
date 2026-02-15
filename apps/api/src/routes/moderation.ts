/**
 * Moderation routes
 * Audit trail and content moderation management
 * Admin/Moderator only
 */
import { Router, Response } from 'express'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'
import { getPrismaClient } from '../services/prisma.js'
import { logger } from '../utils/logger.js'
import { UserRole, PostStatus, CommentStatus } from 'shared/types'

const router = Router()

// Middleware to check admin/moderator role
const adminOnly = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== UserRole.ADMIN && req.user?.role !== 'moderator') {
    res.status(403).json({
      error: 'Only admins and moderators can access moderation features',
      code: 'FORBIDDEN',
      statusCode: 403
    })
    return
  }
  next()
}

// GET /moderation/reports - List all reports
router.get('/reports', authMiddleware, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', status = 'open' } = req.query
    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10))
    const skip = (pageNum - 1) * limitNum

    const prisma = getPrismaClient()

    const where: any = {}
    if (status) {
      where.status = status
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, crp: true }
        },
        relatedPost: {
          select: { id: true, title: true, authorId: true }
        },
        relatedComment: {
          select: { id: true, content: true, authorId: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    })

    const total = await prisma.report.count({ where })

    res.json({
      items: reports,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (error) {
    logger.error('Error fetching reports:', error)
    res.status(500).json({
      error: 'Failed to fetch reports',
      code: 'REPORTS_FETCH_ERROR',
      statusCode: 500
    })
  }
})

// POST /moderation/actions - Apply moderation action
router.post('/actions', authMiddleware, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, targetType, targetId, reportId, notes } = req.body

    // Validate
    if (!action || !targetType || !targetId) {
      res.status(400).json({
        error: 'Missing required fields: action, targetType, targetId',
        code: 'MISSING_FIELDS',
        statusCode: 400
      })
      return
    }

    const validActions = ['hide', 'remove', 'restore', 'warn_author', 'dismiss_report', 'resolve_report']
    if (!validActions.includes(action)) {
      res.status(400).json({
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
        code: 'INVALID_ACTION',
        statusCode: 400
      })
      return
    }

    const prisma = getPrismaClient()

    // Apply action based on type
    if (targetType === 'post') {
      if (action === 'hide') {
        await prisma.post.update({
          where: { id: targetId },
          data: { status: PostStatus.HIDDEN }
        })
      } else if (action === 'remove') {
        await prisma.post.update({
          where: { id: targetId },
          data: { status: PostStatus.REMOVED }
        })
      } else if (action === 'restore') {
        await prisma.post.update({
          where: { id: targetId },
          data: { status: PostStatus.PUBLISHED }
        })
      }
    } else if (targetType === 'comment') {
      if (action === 'hide') {
        await prisma.comment.update({
          where: { id: targetId },
          data: { status: CommentStatus.HIDDEN }
        })
      } else if (action === 'remove') {
        await prisma.comment.update({
          where: { id: targetId },
          data: { status: CommentStatus.REMOVED }
        })
      } else if (action === 'restore') {
        await prisma.comment.update({
          where: { id: targetId },
          data: { status: CommentStatus.PUBLISHED }
        })
      }
    }

    // Update report if provided
    if (reportId) {
      if (action === 'dismiss_report') {
        await prisma.report.update({
          where: { id: reportId },
          data: { status: 'dismissed' }
        })
      } else if (action === 'resolve_report') {
        await prisma.report.update({
          where: { id: reportId },
          data: { status: 'resolved' }
        })
      }
    }

    // Create moderation action log
    const moderationAction = await prisma.moderationAction.create({
      data: {
        moderatorId: req.user!.userId,
        action,
        targetType,
        targetId,
        reportId,
        notes
      }
    })

    logger.info(`Moderation action: ${action} on ${targetType}/${targetId} by ${req.user!.userId}`)

    res.json(moderationAction)
  } catch (error) {
    logger.error('Error creating moderation action:', error)
    res.status(500).json({
      error: 'Failed to apply moderation action',
      code: 'ACTION_ERROR',
      statusCode: 500
    })
  }
})

// GET /moderation/history - View moderation history
router.get('/history', authMiddleware, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10' } = req.query
    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10))
    const skip = (pageNum - 1) * limitNum

    const prisma = getPrismaClient()

    const actions = await prisma.moderationAction.findMany({
      include: {
        moderator: {
          select: { id: true, name: true }
        },
        report: {
          select: { id: true, reason: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    })

    const total = await prisma.moderationAction.count()

    res.json({
      items: actions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (error) {
    logger.error('Error fetching moderation history:', error)
    res.status(500).json({
      error: 'Failed to fetch moderation history',
      code: 'HISTORY_FETCH_ERROR',
      statusCode: 500
    })
  }
})

// POST /posts/:id/report - Report post
router.post('/posts/:id/report', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { reason, details } = req.body

    if (!reason) {
      res.status(400).json({
        error: 'Missing required field: reason',
        code: 'MISSING_REASON',
        statusCode: 400
      })
      return
    }

    const prisma = getPrismaClient()

    // Check post exists
    const post = await prisma.post.findUnique({
      where: { id }
    })

    if (!post) {
      res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        targetType: 'post',
        targetId: id,
        reporterId: req.user!.userId,
        reason,
        details,
        postId: id
      }
    })

    logger.info(`Post reported: ${id} by ${req.user!.userId}`)

    res.status(201).json(report)
  } catch (error) {
    logger.error('Error creating report:', error)
    res.status(500).json({
      error: 'Failed to report post',
      code: 'REPORT_ERROR',
      statusCode: 500
    })
  }
})

// POST /comments/:id/report - Report comment
router.post('/comments/:id/report', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { reason, details } = req.body

    if (!reason) {
      res.status(400).json({
        error: 'Missing required field: reason',
        code: 'MISSING_REASON',
        statusCode: 400
      })
      return
    }

    const prisma = getPrismaClient()

    // Check comment exists
    const comment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      res.status(404).json({
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND',
        statusCode: 404
      })
      return
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        targetType: 'comment',
        targetId: id,
        reporterId: req.user!.userId,
        reason,
        details,
        commentId: id
      }
    })

    logger.info(`Comment reported: ${id} by ${req.user!.userId}`)

    res.status(201).json(report)
  } catch (error) {
    logger.error('Error creating report:', error)
    res.status(500).json({
      error: 'Failed to report comment',
      code: 'REPORT_ERROR',
      statusCode: 500
    })
  }
})

export default router
