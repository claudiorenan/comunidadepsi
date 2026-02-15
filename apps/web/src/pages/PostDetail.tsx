import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Header } from '../components/Header'
import { Modal } from '../components/Modal'
import { LoadingSpinner } from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'

interface PostDetail {
  id: string
  title: string
  content: string
  type: 'challenge' | 'debate'
  tags: string[]
  status: string
  author: {
    id: string
    name: string
    crp: string
    photoUrl?: string
    approach: string
    uf: string
  }
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

interface Comment {
  id: string
  content: string
  status: string
  author: {
    id: string
    name: string
    photoUrl?: string
  }
  createdAt: string
  updatedAt: string
}

export function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/posts/${id}`)
        setPost(response.data)
      } catch (err) {
        setError('Post não encontrado')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [id])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    try {
      setSubmitting(true)
      const response = await api.post(`/posts/${id}/comments`, {
        content: commentContent
      })

      if (post) {
        setPost({
          ...post,
          comments: [response.data, ...post.comments]
        })
      }
      setCommentContent('')
      addToast('Comentário adicionado com sucesso!', 'success')
    } catch (err) {
      addToast('Erro ao adicionar comentário', 'error')
      console.error('Erro ao adicionar comentário:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    try {
      setDeleting(true)
      await api.delete(`/posts/${id}`)
      addToast('Post deletado com sucesso', 'success')
      navigate('/')
    } catch (err) {
      addToast('Erro ao deletar post', 'error')
      console.error('Erro ao deletar post:', err)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">{error || 'Post não encontrado'}</p>
            <button
              onClick={() => navigate('/posts')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Voltar ao Feed
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isAuthor = user?.id === post.author.id
  const isChallenge = post.type === 'challenge'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Post */}
        <article className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <span className={`text-3xl mr-3 ${isChallenge ? '🎯' : '💬'}`} />
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded ${
                isChallenge ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {isChallenge ? 'Desafio' : 'Debate'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            {post.author.photoUrl && (
              <img
                src={post.author.photoUrl}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-bold text-gray-900">{post.author.name}</p>
              <p className="text-sm text-gray-600">
                {post.author.crp} • {post.author.uf}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {isAuthor && (
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => navigate(`/posts/${id}/edit`)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                  disabled={deleting}
                >
                  {deleting ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            )}

            <Modal
              isOpen={showDeleteModal}
              title="Deletar Post"
              message="Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita."
              onConfirm={handleDeletePost}
              onCancel={() => setShowDeleteModal(false)}
              confirmText="Deletar"
              cancelText="Cancelar"
              isDangerous={true}
            />
          </div>

          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Comments Section */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comentários ({post.comments.length})
          </h2>

          {user && (
            <form onSubmit={handleAddComment} className="mb-8 pb-8 border-b border-gray-200">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Adicione um comentário..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
              <button
                type="submit"
                disabled={!commentContent.trim() || submitting}
                className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {submitting ? 'Enviando...' : 'Comentar'}
              </button>
            </form>
          )}

          {post.comments.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            <div className="space-y-6">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start gap-3 mb-2">
                    {comment.author.photoUrl && (
                      <img
                        src={comment.author.photoUrl}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{comment.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 pl-11 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
