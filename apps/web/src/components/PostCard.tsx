import { Link } from 'react-router-dom'

export interface PostCardProps {
  id: string
  title: string
  content: string
  type: 'challenge' | 'debate'
  tags: string[]
  author: {
    name: string
    photoUrl?: string
  }
  createdAt: string
  commentCount?: number
}

export function PostCard({
  id,
  title,
  content,
  type,
  tags,
  author,
  createdAt,
  commentCount = 0
}: PostCardProps) {
  const isChallenge = type === 'challenge'
  const icon = isChallenge ? '🎯' : '💬'
  const label = isChallenge ? 'Desafio' : 'Debate'

  return (
    <Link
      to={`/posts/${id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4"
      style={{ borderColor: isChallenge ? '#6366f1' : '#10b981' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="inline-block text-2xl mr-2">{icon}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded ${isChallenge ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
            {label}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600">
        {title}
      </h3>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{content}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {author.photoUrl && (
            <img src={author.photoUrl} alt={author.name} className="w-6 h-6 rounded-full" />
          )}
          <span className="text-sm text-gray-700 font-medium">{author.name}</span>
        </div>
        <span className="text-xs text-gray-500">{commentCount} comentários</span>
      </div>
    </Link>
  )
}
