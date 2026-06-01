
import { useAuthStore } from '@/store/auth'
import { API_BASE_URL } from './config'

export type ApiOk<T> = { success: true; data: T }
export type ApiErr = { success: false; error: string }

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiOk<T>> {
  const token = useAuthStore.getState().token
  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const fullPath = path.startsWith('http') 
    ? path 
    : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`

  const res = await fetch(fullPath, { ...init, headers })
  const json = (await readJsonSafe(res)) as ApiOk<T> | ApiErr | null

  if (!res.ok) {
    const message =
      (json && 'error' in json && typeof json.error === 'string' && json.error) ||
      `请求失败(${res.status})`
    throw new Error(message)
  }

  if (!json || !('success' in json) || json.success !== true) {
    throw new Error('响应格式不正确')
  }

  return json
}

