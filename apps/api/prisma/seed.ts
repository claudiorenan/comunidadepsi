/**
 * Database seed script
 * Initializes the database with mock data for development
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Cleaning existing data...')
    await prisma.moderationAction.deleteMany()
    await prisma.report.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  }

  // Create mock users (psychologists) with email/password
  console.log('Creating mock users...')
  const user1 = await prisma.user.create({
    data: {
      email: 'marina@example.com',
      password: await hashPassword('senha123'),
      name: 'Dra. Marina Silva',
      crp: '06/12345-SP',
      phone: '(11) 98765-4321',
      photo: 'https://via.placeholder.com/150?text=Marina',
      introduction: 'Especialista em transtornos de ansiedade e fobias',
      instagram: '@dra.marina',
      specialty: 'ansiedade, fobias, adolescentes',
      approach: 'Cognitivo-Comportamental',
      uf: 'SP',
      city: 'São Paulo',
      role: 'psychologist'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'carlos@example.com',
      password: await hashPassword('senha456'),
      name: 'Dr. Carlos Oliveira',
      crp: '06/54321-SP',
      phone: '(11) 99876-5432',
      photo: 'https://via.placeholder.com/150?text=Carlos',
      introduction: 'Terapeuta de casal com 15 anos de experiência',
      instagram: '@dr.carlos',
      specialty: 'relacionamento, terapia de casal, psicodrama',
      approach: 'Psicodrama',
      uf: 'SP',
      city: 'São Paulo',
      role: 'psychologist'
    }
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'juliana@example.com',
      password: await hashPassword('senha789'),
      name: 'Dra. Juliana Costa',
      crp: '06/99999-RJ',
      phone: '(21) 97777-8888',
      photo: 'https://via.placeholder.com/150?text=Juliana',
      introduction: 'Psicóloga infantil e orientadora educacional',
      instagram: '@dra.juliana',
      specialty: 'crianças, adolescentes, educação',
      approach: 'Comportamental, Educacional',
      uf: 'RJ',
      city: 'Rio de Janeiro',
      role: 'psychologist'
    }
  })

  console.log(`✅ Created ${3} users`)

  // Create mock posts
  console.log('Creating mock posts...')
  const post1 = await prisma.post.create({
    data: {
      authorId: user1.id,
      type: 'challenge',
      title: 'Desafio: Tratamento de Ansiedade em Adolescentes',
      content:
        'Estou enfrentando dificuldades em estabelecer rapport com um adolescente de 16 anos que sofre de transtorno de ansiedade generalizada. O paciente se mostra resistente às técnicas de respiração e mindfulness tradicionais. Qual seria a melhor abordagem para engajá-lo?',
      tags: JSON.stringify(['ansiedade', 'adolescentes', 'rapport', 'tcc']),
      status: 'published'
    }
  })

  const post2 = await prisma.post.create({
    data: {
      authorId: user2.id,
      type: 'debate',
      title: 'Debate: Psicodrama vs CBT para relacionamentos tóxicos',
      content:
        'Qual abordagem é mais efetiva para casais com histórico de relacionamentos tóxicos? Psicodrama permite reviver cenas do passado, enquanto CBT trabalha em pensamentos automáticos. Gostaria de ouvir experiências de vocês.',
      tags: JSON.stringify(['psicodrama', 'terapia-casal', 'relacionamentos', 'metodologia']),
      status: 'published'
    }
  })

  const post3 = await prisma.post.create({
    data: {
      authorId: user3.id,
      type: 'challenge',
      title: 'Dificuldade com paciente que evita falar sobre trauma',
      content:
        'Tenho um paciente que foi vítima de violência sexual, mas recusa-se a abordar o assunto. Como lidar com essa resistência sem forçar a abertura?',
      tags: JSON.stringify(['trauma', 'segurança-psicológica', 'resistência']),
      status: 'published'
    }
  })

  console.log(`✅ Created ${3} posts`)

  // Create mock comments
  console.log('Creating mock comments...')
  const comment1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user2.id,
      content:
        'Tenho sucesso com adolescentes usando psicodrama de grupos. Eles respondem bem a vivências práticas.',
      status: 'published'
    }
  })

  const comment2 = await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: user1.id,
      content:
        'Na minha experiência, a combinação de ambas as abordagens funciona melhor. Comece com CBT para estabilizar, depois use psicodrama para ressignificar.',
      status: 'published'
    }
  })

  console.log(`✅ Created ${2} comments`)
  console.log('✅ Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
