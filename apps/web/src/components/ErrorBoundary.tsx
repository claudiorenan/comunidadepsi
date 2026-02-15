import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">😬</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Algo deu errado</h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message ||
                'Ocorreu um erro inesperado. Tente recarregar a página.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
