import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Por favor, insira seu email')
      return
    }

    if (!password) {
      setError('Por favor, insira sua senha')
      return
    }

    try {
      setLoading(true)
      setError('')
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleFillTestCreds = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">ComunidadePsi</h1>
          <p className="text-gray-600">Acesso à Plataforma de Compartilhamento Clínico</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-4">📝 Credenciais de Teste</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleFillTestCreds('marina@example.com', 'senha123')}
              className="w-full text-left bg-blue-50 hover:bg-blue-100 p-3 rounded text-sm text-gray-700 transition"
            >
              <div className="font-semibold text-indigo-700">Dra. Marina Silva</div>
              <div className="text-xs text-gray-600">marina@example.com / senha123</div>
            </button>

            <button
              type="button"
              onClick={() => handleFillTestCreds('carlos@example.com', 'senha456')}
              className="w-full text-left bg-blue-50 hover:bg-blue-100 p-3 rounded text-sm text-gray-700 transition"
            >
              <div className="font-semibold text-indigo-700">Dr. Carlos Oliveira</div>
              <div className="text-xs text-gray-600">carlos@example.com / senha456</div>
            </button>

            <button
              type="button"
              onClick={() => handleFillTestCreds('juliana@example.com', 'senha789')}
              className="w-full text-left bg-blue-50 hover:bg-blue-100 p-3 rounded text-sm text-gray-700 transition"
            >
              <div className="font-semibold text-indigo-700">Dra. Juliana Costa</div>
              <div className="text-xs text-gray-600">juliana@example.com / senha789</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
