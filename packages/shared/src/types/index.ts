/**
 * ComunidadePsi Shared Types
 * Entities: User, Post, Comment, Report, ModerationAction
 */

// === Role Enum ===
export enum UserRole {
  PSYCHOLOGIST = 'psychologist',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

// === User (Psychologist) ===
export interface User {
  id: string
  externalId: string
  name: string
  crp: string
  approach: string
  uf: string
  city?: string
  photoUrl?: string
  bio?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserInput = Partial<Omit<User, 'id' | 'externalId' | 'createdAt' | 'updatedAt'>>

// === Post Types ===
export enum PostType {
  CHALLENGE = 'challenge',
  DEBATE = 'debate'
}

export enum PostStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  REMOVED = 'removed',
  PENDING_REVIEW = 'pending_review'
}

export interface Post {
  id: string
  authorId: string
  type: PostType
  title: string
  content: string
  tags: string[]
  status: PostStatus
  createdAt: Date
  updatedAt: Date
}

export type CreatePostInput = Omit<Post, 'id' | 'status' | 'createdAt' | 'updatedAt'>
export type UpdatePostInput = Partial<Omit<Post, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>>

// === Comment ===
export enum CommentStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  REMOVED = 'removed'
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  status: CommentStatus
  createdAt: Date
  updatedAt: Date
}

export type CreateCommentInput = Omit<Comment, 'id' | 'status' | 'createdAt' | 'updatedAt'>
export type UpdateCommentInput = Partial<Omit<Comment, 'id' | 'postId' | 'authorId' | 'createdAt' | 'updatedAt'>>

// === Report (Denúncia) ===
export enum ReportTargetType {
  POST = 'post',
  COMMENT = 'comment'
}

export enum ReportReason {
  SENSITIVE_DATA = 'sensitive_data',
  UNETHICAL = 'unethical',
  HARASSMENT = 'harassment',
  OTHER = 'other'
}

export enum ReportStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export interface Report {
  id: string
  targetType: ReportTargetType
  targetId: string
  reporterId: string
  reason: ReportReason
  details?: string
  status: ReportStatus
  createdAt: Date
  updatedAt: Date
}

export type CreateReportInput = Omit<Report, 'id' | 'status' | 'createdAt' | 'updatedAt'>

// === Moderation Action (Auditoria) ===
export enum ModAction {
  HIDE = 'hide',
  REMOVE = 'remove',
  RESTORE = 'restore',
  WARN_AUTHOR = 'warn_author',
  DISMISS_REPORT = 'dismiss_report',
  RESOLVE_REPORT = 'resolve_report'
}

export interface ModerationAction {
  id: string
  moderatorId: string
  action: ModAction
  targetType: ReportTargetType
  targetId: string
  reportId?: string
  notes?: string
  createdAt: Date
}

export type CreateModerationActionInput = Omit<ModerationAction, 'id' | 'createdAt'>

// === Content Safety ===
export enum RiskLevel {
  LOW = 'baixo',
  MEDIUM = 'médio',
  HIGH = 'alto'
}

export interface DetectionFlag {
  type: string
  pattern: string
  message: string
  count: number
}

export interface ScanResult {
  riskLevel: RiskLevel
  score: number
  flags: DetectionFlag[]
  suggestions: string[]
}

// === Authentication ===
export interface TokenPayload {
  userId: string
  externalId: string
  role: UserRole
  iat: number
  exp: number
}

export interface LoginRequest {
  code: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export interface ExternalApiAuthResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  psychologist: {
    id: string
    nome: string
    crp: string
    abordagem: string
    uf: string
    cidade?: string
    foto_url?: string
    bio?: string
  }
}

// === API Responses ===
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// === Error ===
export interface ApiError {
  statusCode: number
  message: string
  code: string
  details?: Record<string, unknown>
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}
