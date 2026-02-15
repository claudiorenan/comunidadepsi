/**
 * Test helpers and mock utilities
 */
import { vi } from 'vitest'

export const mockPrismaClient = () => {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    post: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    comment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    report: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    moderationAction: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    $disconnect: vi.fn(),
    $on: vi.fn()
  }
}

export const mockUser = {
  id: 'user_1',
  externalId: 'ext_001',
  name: 'Dr. Silva',
  crp: '06/12345-SP',
  approach: 'Cognitivo-Comportamental',
  uf: 'SP',
  city: 'São Paulo',
  photoUrl: 'https://example.com/photo.jpg',
  bio: 'Especialista em ansiedade',
  role: 'psychologist',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockPost = {
  id: 'post_1',
  authorId: 'user_1',
  type: 'challenge',
  title: 'Desafio: Tratamento de Ansiedade',
  content: 'Estou tendo dificuldades em tratar pacientes com ansiedade',
  tags: ['ansiedade', 'tcc'],
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockComment = {
  id: 'comment_1',
  postId: 'post_1',
  authorId: 'user_1',
  content: 'Ótima pergunta, já enfrentei situações similares',
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const createMockAuthToken = (userId: string = 'user_1') => {
  // Note: In real tests, use jwt.sign with test secret
  return 'mock_token_' + userId
}
