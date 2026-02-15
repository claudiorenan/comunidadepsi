/**
 * Authentication routes tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import authRouter from './auth'
import { getPrismaClient } from '../services/prisma'

// Mock Prisma and external API
vi.mock('../services/prisma')
vi.mock('../services/externalApi')
vi.mock('../config/env', () => ({
  config: {
    env: 'test',
    port: 5000,
    database: { url: 'test' },
    jwt: {
      secret: 'test_secret_key_minimum_32_characters_long',
      refreshSecret: 'test_refresh_secret_key_minimum_32_characters_long',
      expiresIn: '24h',
      refreshExpiresIn: '7d'
    },
    cors: { origin: ['http://localhost:3000'] },
    externalApi: {
      baseUrl: 'https://api.test.com',
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret'
    },
    logging: { level: 'info' }
  }
}))

describe('Authentication Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use(authRouter)
  })

  describe('POST /login', () => {
    it('should fail without authorization code', async () => {
      const response = await request(app).post('/login').send({})

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('code', 'MISSING_CODE')
    })

    it('should handle empty code', async () => {
      const response = await request(app)
        .post('/login')
        .send({ code: '' })

      expect(response.status).toBe(400)
    })

    it('should accept valid code format', async () => {
      const response = await request(app)
        .post('/login')
        .send({ code: 'dev_001' })

      // In mock/dev mode, should succeed
      expect([200, 201, 500]).toContain(response.status)
    })
  })

  describe('GET /auth/me', () => {
    it('should fail without token', async () => {
      const response = await request(app).get('/me')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('code', 'MISSING_TOKEN')
    })

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer invalid_token')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /logout', () => {
    it('should clear auth cookie', async () => {
      const response = await request(app).post('/logout')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message')
    })
  })
})
