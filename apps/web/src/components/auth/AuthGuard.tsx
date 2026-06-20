import type { ReactNode } from 'react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { t } from '../../lib/i18n'
import type { AppLanguage } from '../../lib/types'
import { AuthScreen } from './AuthScreen'

export type AuthGuardProps = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  children: ReactNode
}

export function AuthGuard({ language, setLanguage, children }: AuthGuardProps) {
  const { status, configured } = useAuth()
  const [stuck] = useState(false)

  if (status === 'loading' && !stuck) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <div className="auth-loading-pulse" />
        <p>{t(language, 'authLoading')}</p>
      </div>
    )
  }

  if (!configured) {
    return (
      <div className="auth-shell">
        <main className="auth-main">
          <section className="auth-card">
            <header>
              <h2>{t(language, 'authConfigTitle')}</h2>
              <p>{t(language, 'authConfigHint')}</p>
            </header>
            <div className="magic-warning">
              <span>{t(language, 'authNotConfigured')}</span>
            </div>
          </section>
        </main>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <AuthScreen configured={configured} language={language} setLanguage={setLanguage} />
  }

  return <>{children}</>
}