import { Header } from '../components/Header'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export function Profile() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start gap-6 mb-8">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center text-4xl">
                👤
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="space-y-1 text-gray-600">
                <p>
                  <strong>CRP:</strong> {user.crp}
                </p>
                <p>
                  <strong>Abordagem:</strong> {user.approach}
                </p>
                <p>
                  <strong>Estado:</strong> {user.uf}
                  {user.city && ` • ${user.city}`}
                </p>
                <p>
                  <strong>Role:</strong> {user.role === 'psychologist' ? 'Psicólogo(a)' : 'Administrador'}
                </p>
              </div>
            </div>
          </div>

          {user.introduction && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Biografia</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{user.introduction}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📝 Nota:</strong> Edição de perfil está sendo desenvolvida. Entre em contato com
              suporte para alterações.
            </p>
          </div>

          <div className="mt-8">
            <Link to="/posts" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Voltar ao Feed
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
