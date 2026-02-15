import { useState, useCallback } from 'react'
import api from '../services/api'
import { AxiosError } from 'axios'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (method: 'get' | 'post' | 'patch' | 'delete', url: string, body?: any) => {
      try {
        setLoading(true)
        setError(null)

        let response
        switch (method) {
          case 'get':
            response = await api.get<T>(url)
            break
          case 'post':
            response = await api.post<T>(url, body)
            break
          case 'patch':
            response = await api.patch<T>(url, body)
            break
          case 'delete':
            response = await api.delete<T>(url)
            break
        }

        setData(response.data)
        options?.onSuccess?.(response.data)
        return response.data
      } catch (err) {
        const message =
          err instanceof AxiosError
            ? err.response?.data?.error || err.message
            : err instanceof Error
              ? err.message
              : 'An error occurred'

        setError(message)
        options?.onError?.(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const get = useCallback((url: string) => execute('get', url), [execute])
  const post = useCallback((url: string, body: any) => execute('post', url, body), [execute])
  const patch = useCallback((url: string, body: any) => execute('patch', url, body), [execute])
  const del = useCallback((url: string) => execute('delete', url), [execute])

  return { data, loading, error, get, post, patch, del }
}
