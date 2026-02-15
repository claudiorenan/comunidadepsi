import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Header } from '../components/Header'
import { useToast } from '../components/Toast'

export function CreatePost() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    type: 'challenge' as 'challenge' | 'debate',
    title: '',
    content: '',
    tags: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      setError('Título é obrigatório')
      addToast('Título é obrigatório', 'warning')
      return
    }
    if (!formData.content.trim()) {
      setError('Conteúdo é obrigatório')
      addToast('Conteúdo é obrigatório', 'warning')
      return
    }

    try {
      setLoading(true)
      setError('')

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const response = await api.post('/posts', {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        tags
      })

      // Check for content safety warnings
      if (response.data.contentSafetyWarning) {
        addToast('⚠️ Seu post foi publicado mas contém dados que requerem revisão', 'warning')
      } else {
        addToast('✅ Post publicado com sucesso!', 'success')
      }

      const postData = response.data.data || response.data
      navigate(`/posts/${postData.id}`)
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        (err instanceof Error ? err.message : 'Erro ao criar post')
      setError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Novo Post</h1>
          <p className="text-gray-600 mb-8">Compartilhe suas experiências clínicas com a comunidade</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-bold text-gray-900 mb-2">
                Tipo de Post
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="challenge">
                  🎯 Desafio - Pedir ajuda com algo que está difícil
                </option>
                <option value="debate">
                  💬 Debate - Discutir um tópico profissional
                </option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
                Título
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Um título conciso e descritivo"
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200</p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-bold text-gray-900 mb-2">
                Conteúdo
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Descreva seu desafio ou tópico em detalhes..."
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Não inclua dados pessoais como CPF, telefone ou endereço
              </p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-bold text-gray-900 mb-2">
                Tags (separadas por vírgula)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Ex: ansiedade, adolescentes, relacionamento"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* LGPD Warning */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>🔒 Lembrança de Segurança:</strong> Sua publicação será automaticamente
                verificada para detectar dados sensíveis. Certifique-se de não incluir informações
                pessoais dos pacientes ou suas próprias informações de contato.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-bold"
              >
                {loading ? 'Publicando...' : 'Publicar Post'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/posts')}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
