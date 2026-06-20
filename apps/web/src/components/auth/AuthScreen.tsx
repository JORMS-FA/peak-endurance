import { useState } from 'react'
import { Globe, Mountain } from 'lucide-react'
import { MagicLinkForm } from './MagicLinkForm'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../hooks/useI18n'
import { LANGUAGES, APP_NAME } from '../../lib/constants'
import { supabase } from '../../lib/supabase'
import type { AppLanguage } from '../../lib/types'

export function AuthScreen() {
  const { t } = useI18n()
  const { configured } = useAuth()
  const { language, setLanguage } = useTheme()
  const [mode, setMode] = useState<'magic' | 'password'>('magic')

  async function handleGoogleLogin() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  return (
    <div className="auth-shell">
      <header className="auth-header">
        <div className="auth-brand">
          <Mountain size={22} />
          <span>{APP_NAME}</span>
        </div>
        <label className="lang-switch">
          <Globe size={14} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>{t('authTitle')}</h1>
            <p>{t('authSubtitle')}</p>
          </div>

          {!configured ? (
            <div className="auth-warning">
              <p>{t('notConfigured')}</p>
              <code>VITE_SUPABASE_URL</code>
              <code>VITE_SUPABASE_ANON_KEY</code>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleLogin}
              >
                <svg width="18" height="18" viewBox="0 0 48 48"><path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/><path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/><path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/><path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/></svg>
                Google
              </button>

              <div className="auth-divider">
                <span>{t('orContinueWith')}</span>
              </div>

              {mode === 'magic' ? (
                <>
                  <MagicLinkForm />
                  <button
                    type="button"
                    className="auth-toggle"
                    onClick={() => setMode('password')}
                  >
                    {t('signIn')} con contrasena
                  </button>
                </>
              ) : (
                <>
                  <PasswordForm />
                  <button
                    type="button"
                    className="auth-toggle"
                    onClick={() => setMode('magic')}
                  >
                    {t('sendMagicLink')}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function PasswordForm() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { signInWithPassword, signUpWithPassword } = await import('../../lib/auth')
    const result = isSignUp
      ? await signUpWithPassword(email, password)
      : await signInWithPassword(email, password)

    setLoading(false)
    if (!result.ok) setError(result.message)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span>{t('email')}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          autoComplete="email"
          required
        />
      </label>
      <label className="form-field">
        <span>{t('password')}</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          minLength={6}
        />
      </label>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? t('sending') : isSignUp ? t('signUp') : t('signIn')}
      </button>
      <button
        type="button"
        className="auth-toggle"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? t('signIn') : t('signUp')}
      </button>
    </form>
  )
}
