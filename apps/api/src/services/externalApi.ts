/**
 * External API client for OAuth integration
 * Handles communication with external psychologist registry API
 */
import axios, { AxiosInstance } from 'axios'
import { config } from '../config/env.js'
import { logger } from '../utils/logger.js'
import { AppError } from 'shared/types'

export interface OAuthTokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}

export interface PsychologistProfile {
  id: string
  name: string
  crp: string
  approach: string
  uf: string
  city?: string
  photoUrl?: string
  bio?: string
}

class ExternalApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: config.externalApi.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add auth interceptor
    this.client.interceptors.request.use((conf) => {
      conf.headers['X-Client-Id'] = config.externalApi.clientId
      conf.headers['X-Client-Secret'] = config.externalApi.clientSecret
      return conf
    })
  }

  /**
   * Exchange OAuth authorization code for tokens
   * In dev mode, accepts any code
   */
  async exchangeAuthorizationCode(code: string): Promise<OAuthTokenResponse> {
    try {
      // Dev mode: accept any code and return mock token
      if (config.env === 'development' || code.startsWith('dev_')) {
        logger.info(`[DEV MODE] Accepting code: ${code}`)
        return {
          accessToken: `mock_access_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
          expiresIn: 3600,
          tokenType: 'Bearer'
        }
      }

      logger.info(`Exchanging authorization code for tokens`)
      const response = await this.client.post('/oauth/token', {
        code,
        clientId: config.externalApi.clientId,
        clientSecret: config.externalApi.clientSecret
      })

      if (!response.data.accessToken) {
        throw new Error('Invalid token response from external API')
      }

      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn || 3600,
        tokenType: response.data.tokenType || 'Bearer'
      }
    } catch (error) {
      logger.error('Error exchanging authorization code:', error)
      throw new AppError(
        401,
        'Failed to exchange authorization code',
        'AUTH_CODE_EXCHANGE_FAILED'
      )
    }
  }

  /**
   * Get psychologist profile from external API
   */
  async getPsychologistProfile(accessToken: string): Promise<PsychologistProfile> {
    try {
      // Dev mode: return mock profile
      if (config.env === 'development') {
        logger.info(`[DEV MODE] Returning mock psychologist profile`)
        return {
          id: `ext_${Date.now()}`,
          name: 'Dr. Silva',
          crp: '12345/SP',
          approach: 'Cognitivo-Comportamental',
          uf: 'SP',
          city: 'São Paulo'
        }
      }

      logger.info(`Fetching psychologist profile from external API`)
      const response = await this.client.get('/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.data.id || !response.data.crp) {
        throw new Error('Invalid profile data from external API')
      }

      return {
        id: response.data.id,
        name: response.data.name,
        crp: response.data.crp,
        approach: response.data.approach || '',
        uf: response.data.uf || '',
        city: response.data.city,
        photoUrl: response.data.photoUrl,
        bio: response.data.bio
      }
    } catch (error) {
      logger.error('Error fetching psychologist profile:', error)
      throw new AppError(
        401,
        'Failed to fetch psychologist profile',
        'PROFILE_FETCH_FAILED'
      )
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    try {
      // Dev mode
      if (config.env === 'development') {
        logger.info(`[DEV MODE] Refreshing token`)
        return {
          accessToken: `mock_access_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
          expiresIn: 3600,
          tokenType: 'Bearer'
        }
      }

      logger.info(`Refreshing access token`)
      const response = await this.client.post('/oauth/refresh', {
        refreshToken,
        clientId: config.externalApi.clientId,
        clientSecret: config.externalApi.clientSecret
      })

      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || refreshToken,
        expiresIn: response.data.expiresIn || 3600,
        tokenType: response.data.tokenType || 'Bearer'
      }
    } catch (error) {
      logger.error('Error refreshing access token:', error)
      throw new AppError(
        401,
        'Failed to refresh access token',
        'TOKEN_REFRESH_FAILED'
      )
    }
  }
}

// Singleton instance
let clientInstance: ExternalApiClient | null = null

export function getExternalApiClient(): ExternalApiClient {
  if (!clientInstance) {
    clientInstance = new ExternalApiClient()
  }
  return clientInstance
}
