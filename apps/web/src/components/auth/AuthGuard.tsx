import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { AuthScreen } from './AuthScreen'

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

  // Not authenticated or not configured -> show auth screen
  if (!configured || status !== 'authenticated') {
    return <AuthScreen />
  }

  return <>{children}</>
}
