import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { Header } from '../components/Header'
import { PostCard } from '../components/PostCard'
import { LoadingSpinner } from '../components/ProtectedRoute'

interface Post {
  id: string
  title: string
  content: string
  type: 'challenge' | 'debate'
  tags: string[]
  author: {
    id: string
    name: string
    photoUrl?: string
  }
  createdAt: string
  _count?: { comments: number }
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [type, setType] = useState<'all' | 'challenge' | 'debate'>('all')
  const [search, setSearch] = useState('')

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(type !== 'all' && { type }),
        ...(search && { search })
      })

      const response = await api.get(`/posts?${params}`)
      setPosts(response.data.items)
      setTotalPages(response.data.totalPages)
    } catch (err) {
      setError('Erro ao carregar posts. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [page, type])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadPosts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Buscar posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Buscar
              </button>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="all"
                  checked={type === 'all'}
                  onChange={(e) => {
                    setType(e.target.value as any)
                    setPage(1)
                  }}
                />
                <span className="text-gray-700">Todos</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="challenge"
                  checked={type === 'challenge'}
                  onChange={(e) => {
                    setType(e.target.value as any)
                    setPage(1)
                  }}
                />
                <span className="text-gray-700">🎯 Desafios</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="debate"
                  checked={type === 'debate'}
                  onChange={(e) => {
                    setType(e.target.value as any)
                    setPage(1)
                  }}
                />
                <span className="text-gray-700">💬 Debates</span>
              </label>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Nenhum post encontrado</p>
            <Link
              to="/posts/new"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Criar Primeiro Post
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid gap-6 mb-8">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  type={post.type}
                  tags={post.tags}
                  author={post.author}
                  createdAt={post.createdAt}
                  commentCount={post._count?.comments || 0}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <span className="px-4 py-2">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
