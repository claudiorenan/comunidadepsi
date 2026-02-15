/**
 * Database seed script
 * Initializes the database with mock data for development
 */
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

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

  // Create mock users (psychologists)
  console.log('Creating mock users...')
  const user1 = await prisma.user.create({
    data: {
      externalId: 'ext_001',
      name: 'Dra. Marina Silva',
      crp: '06/12345-SP',
      approach: 'Cognitivo-Comportamental',
      uf: 'SP',
      city: 'São Paulo',
      bio: 'Especialista em transtornos de ansiedade e fobias',
      photoUrl: 'https://via.placeholder.com/150',
      role: 'psychologist'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      externalId: 'ext_002',
      name: 'Dr. Carlos Oliveira',
      crp: '06/54321-SP',
      approach: 'Psicodrama',
      uf: 'SP',
      city: 'São Paulo',
      bio: 'Terapeuta de casal com 15 anos de experiência',
      photoUrl: 'https://via.placeholder.com/150',
      role: 'psychologist'
    }
  })

  const admin = await prisma.user.create({
    data: {
      externalId: 'ext_admin_001',
      name: 'Admin ComunidadePsi',
      crp: '00/00000-XX',
      approach: 'Administração',
      uf: 'SP',
      role: 'admin'
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
      tags: ['ansiedade', 'adolescentes', 'rapport', 'tcc']
    }
  })

  const post2 = await prisma.post.create({
    data: {
      authorId: user2.id,
      type: 'debate',
      title: 'Debate: Psicodrama vs CBT para relacionamentos tóxicos',
      content:
        'Qual abordagem é mais efetiva para casais com histórico de relacionamentos tóxicos? Psicodrama permite reviver cenas do passado, enquanto CBT trabalha em pensamentos automáticos. Gostaria de ouvir experiências de vocês.',
      tags: ['psicodrama', 'terapia-casal', 'relacionamentos', 'metodologia']
    }
  })

  const post3 = await prisma.post.create({
    data: {
      authorId: user1.id,
      type: 'challenge',
      title: 'Dificuldade com paciente que evita falar sobre trauma',
      content:
        'Tenho um paciente que foi vítima de violência sexual, mas recusa-se a abordar o assunto. Como lidar com essa resistência sem forçar a abertura?',
      tags: ['trauma', 'segurança-psicológica', 'resistência']
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
        'Excelente pergunta! No meu consultório uso uma abordagem lúdica com adolescentes. Técnicas como jogos terapêuticos aumentam bastante o engajamento.'
    }
  })

  const comment2 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user1.id,
      content:
        'Obrigada pela sugestão! Vou tentar incorporar isso nas próximas sessões. Você recomenda algum jogo específico?'
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
