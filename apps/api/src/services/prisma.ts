/**
 * Prisma Client singleton
 * Ensures a single database connection pool
 */
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger.js'

let prisma: PrismaClient | null = null

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stderr' },
        { level: 'warn', emit: 'stderr' }
      ]
    })

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e: any) => {
        logger.debug(`Query: ${e.query}`)
        logger.debug(`Duration: ${e.duration}ms`)
      })
    }

    logger.info('Prisma Client initialized')
  }

  return prisma
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    logger.info('Prisma Client disconnected')
    prisma = null
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await disconnectPrisma()
})

process.on('SIGINT', async () => {
  await disconnectPrisma()
})

export default getPrismaClient
