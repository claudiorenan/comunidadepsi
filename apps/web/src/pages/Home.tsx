import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { useAuth } from '../hooks/useAuth'

export function Home() {
  const { user } = useAuth()

  // If logged in, redirect to feed
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Você está pronto para compartilhar suas experiências clínicas
          </p>
          <Link
            to="/posts"
            className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg font-bold rounded-lg hover:bg-indigo-700 transition"
          >
            Ir para o Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Compartilhe Experiências Clínicas
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Uma comunidade segura e LGPD-compliant para psicólogos compartilharem desafios clínicos
            e debaterem práticas
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg font-bold rounded-lg hover:bg-indigo-700 transition"
          >
            Entrar na Plataforma
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Desafios Clínicos</h3>
            <p className="text-gray-600">
              Compartilhe desafios que enfrenta na prática clínica e obtenha insights de colegas
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Debates Profissionais</h3>
            <p className="text-gray-600">
              Participe de debates construtivos sobre tópicos relevantes da psicologia
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Segurança LGPD</h3>
            <p className="text-gray-600">
              Proteção garantida com conformidade total à Lei Geral de Proteção de Dados
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-indigo-900 text-white p-8 rounded-lg text-center">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold">100+</div>
              <p className="text-indigo-200 mt-2">Psicólogos Ativos</p>
            </div>
            <div>
              <div className="text-4xl font-bold">500+</div>
              <p className="text-indigo-200 mt-2">Desafios Compartilhados</p>
            </div>
            <div>
              <div className="text-4xl font-bold">2K+</div>
              <p className="text-indigo-200 mt-2">Discussões Ativas</p>
            </div>
            <div>
              <div className="text-4xl font-bold">24/7</div>
              <p className="text-indigo-200 mt-2">Suporte Disponível</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h3>
          <p className="text-gray-600 mb-8">
            Junte-se à nossa comunidade de profissionais da saúde mental
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg font-bold rounded-lg hover:bg-indigo-700 transition"
          >
            Entrar Agora
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 ComunidadePsi. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">
            Plataforma desenvolvida com ❤️ para a comunidade psicológica
          </p>
        </div>
      </footer>
    </div>
  )
}
