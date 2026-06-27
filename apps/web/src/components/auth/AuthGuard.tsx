import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Onboarding } from '../../pages/Onboarding'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { status, configured, profile } = useAuth()

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

  // Show onboarding if not completed.
  // If the user explicitly cleared the localStorage flag (reset button),
  // show onboarding even if the DB still says completed.
  const doneFlag = profile ? localStorage.getItem(`peak_onboarding_done_${profile.id}`) : null
  if (profile && !doneFlag) {
    return <Onboarding />
  }

  return <>{children}</>
}
