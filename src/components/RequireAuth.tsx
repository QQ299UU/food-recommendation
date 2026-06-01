import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import type { ReactNode } from 'react'

export default function RequireAuth(props: {
  children: ReactNode
  roles?: string[]
}) {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.user?.role)

  if (!token) return <Navigate to="/login" replace />
  if (props.roles && (!role || !props.roles.includes(role))) {
    return <Navigate to="/" replace />
  }

  return <>{props.children}</>
}
