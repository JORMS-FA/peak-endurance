import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { status, configured } = useAuth()

  // Show loading spinner
  if (status === 'loading') {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    )
  }

  // Not authenticated or not configured -> redirect to login
  if (!configured || status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
