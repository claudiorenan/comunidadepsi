/**
 * ComunidadePsi Backend API
 * Express.js + TypeScript
 */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

import { config } from './config/env.js'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { contentSafetyCheckMiddleware } from './middleware/contentSafetyCheck.js'

// Routes
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import postsRouter from './routes/posts.js'
import commentsRouter from './routes/comments.js'
import moderationRouter from './routes/moderation.js'

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

// Content safety check for POST/PATCH
app.use(contentSafetyCheckMiddleware)

// Logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/posts', postsRouter)
app.use('/comments', commentsRouter)
app.use('/moderation', moderationRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    statusCode: 404
  })
})

// Error handler (must be last)
app.use(errorHandler)

// Start server
const port = config.port

app.listen(port, () => {
  logger.info(`🚀 API running on http://localhost:${port}`)
  logger.info(`Environment: ${config.env}`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...')
  process.exit(0)
})

export default app
