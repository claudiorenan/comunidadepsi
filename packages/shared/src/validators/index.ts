/**
 * ComunidadePsi Shared Validators (Zod)
 */

import { z } from 'zod'
import { UserRole, PostType, ReportReason } from '../types/index.js'

// === User Validation ===
export const UserRoleEnum = z.nativeEnum(UserRole)

export const userSchema = z.object({
  id: z.string().cuid(),
  externalId: z.string().min(1),
  name: z.string().min(2).max(255),
  crp: z.string().min(4).max(20),
  approach: z.string().min(2).max(255),
  uf: z.string().length(2).toUpperCase(),
  city: z.string().max(255).optional(),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  role: UserRoleEnum,
  createdAt: z.date(),
  updatedAt: z.date()
})

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const updateUserSchema = userSchema
  .omit({
    id: true,
    externalId: true,
    createdAt: true,
    updatedAt: true
  })
  .partial()

// === Post Validation ===
export const PostTypeEnum = z.nativeEnum(PostType)

export const postSchema = z.object({
  id: z.string().cuid(),
  authorId: z.string().cuid(),
  type: PostTypeEnum,
  title: z.string().min(5).max(200),
  content: z.string().min(20).max(10000),
  tags: z.array(z.string().max(50)).max(5),
  status: z.enum(['published', 'hidden', 'removed', 'pending_review']),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const createPostSchema = postSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
})

export const updatePostSchema = postSchema
  .omit({
    id: true,
    authorId: true,
    createdAt: true,
    updatedAt: true
  })
  .partial()

// === Comment Validation ===
export const commentSchema = z.object({
  id: z.string().cuid(),
  postId: z.string().cuid(),
  authorId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  status: z.enum(['published', 'hidden', 'removed']),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const createCommentSchema = commentSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
})

export const updateCommentSchema = commentSchema
  .omit({
    id: true,
    postId: true,
    authorId: true,
    createdAt: true,
    updatedAt: true
  })
  .partial()

// === Report Validation ===
export const ReportReasonEnum = z.nativeEnum(ReportReason)

export const reportSchema = z.object({
  id: z.string().cuid(),
  targetType: z.enum(['post', 'comment']),
  targetId: z.string().cuid(),
  reporterId: z.string().cuid(),
  reason: ReportReasonEnum,
  details: z.string().max(1000).optional(),
  status: z.enum(['open', 'under_review', 'resolved', 'dismissed']),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const createReportSchema = reportSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
})

// === Moderation Action Validation ===
export const moderationActionSchema = z.object({
  id: z.string().cuid(),
  moderatorId: z.string().cuid(),
  action: z.enum(['hide', 'remove', 'restore', 'warn_author', 'dismiss_report', 'resolve_report']),
  targetType: z.enum(['post', 'comment']),
  targetId: z.string().cuid(),
  reportId: z.string().cuid().optional(),
  notes: z.string().max(500).optional(),
  createdAt: z.date()
})

export const createModerationActionSchema = moderationActionSchema.omit({
  id: true,
  createdAt: true
})

// === Authentication Validation ===
export const loginRequestSchema = z.object({
  code: z.string().min(1)
})

export const tokenPayloadSchema = z.object({
  userId: z.string().cuid(),
  externalId: z.string(),
  role: UserRoleEnum,
  iat: z.number(),
  exp: z.number()
})

// === Pagination Validation ===
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  search: z.string().optional()
})

export type PaginationInput = z.infer<typeof paginationSchema>

// === Validator inference types (for schema usage) ===
// Note: Core types are exported from types/index.ts
// These are available if needed for validator-specific inference
