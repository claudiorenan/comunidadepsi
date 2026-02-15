import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="hover:text-indigo-600 transition">
            <div>
              <h1 className="text-2xl font-bold text-indigo-900">ComunidadePsi</h1>
              <p className="text-gray-600 text-xs">Compartilhamento Clínico</p>
            </div>
          </Link>

          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <Link
                  to="/posts"
                  className="text-gray-700 hover:text-indigo-900 font-medium transition"
                >
                  Feed
                </Link>
                <Link
                  to="/posts/new"
                  className="text-gray-700 hover:text-indigo-900 font-medium transition"
                >
                  Novo Post
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-indigo-900 font-medium transition"
                >
                  Perfil
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/moderation"
                    className="text-gray-700 hover:text-indigo-900 font-medium transition"
                  >
                    Moderação
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-medium"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
