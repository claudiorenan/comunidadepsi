/**
 * Environment configuration
 */
import dotenv from 'dotenv'

dotenv.config()

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/comunidadepsi_dev'
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_key_minimum_32_characters_long',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_key_minimum_32_characters_long',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },

  // CORS
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',')
  },

  // External API
  externalApi: {
    baseUrl: process.env.EXTERNAL_API_BASE_URL || 'https://api.example.com',
    clientId: process.env.EXTERNAL_API_CLIENT_ID || 'dev_client_id',
    clientSecret: process.env.EXTERNAL_API_CLIENT_SECRET || 'dev_client_secret'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
}

// Validation
if (config.env === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DATABASE_URL',
    'EXTERNAL_API_CLIENT_ID',
    'EXTERNAL_API_CLIENT_SECRET'
  ]

  const missing = requiredEnvVars.filter(v => !process.env[v])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
