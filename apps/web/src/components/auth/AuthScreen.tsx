import { Globe } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { appBrand, languages } from '../../lib/ui'
import type { AppLanguage } from '../../lib/types'
import peakLogo from '../../assets/peak-logo.png'
import { MagicLinkForm } from './MagicLinkForm'
import { supabase } from '../../lib/supabase'

type Props = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

export function AuthScreen({ language, setLanguage }: Props) {
  const { configured } = useAuth()

  async function handleGoogleLogin() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="signin-shell">
      <div className="signin-panel">
        <div className="brand-lockup">
          <img src={peakLogo} alt={appBrand.name} className="brand-logo signin-logo" />
        </div>

        <h1>{appBrand.name}</h1>
        <p>Tu panel de rendimiento para planificar, ajustar y optimizar cada semana.</p>

        {configured ? (
          <>
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              Continuar con Google
            </button>

            <div className="divider">
              <span>o continúa con email</span>
            </div>

            <MagicLinkForm />
          </>
        ) : (
          <div className="status-callout" role="alert">
            La autenticación aún no está configurada. Define <code>VITE_SUPABASE_URL</code> y
            <code> VITE_SUPABASE_ANON_KEY</code> en <code>.env.local</code> para habilitar el acceso.
          </div>
        )}

        <label className="language-switch inline-switch">
          <Globe size={16} />
          <select value={language} onChange={(event) => setLanguage(event.target.value as AppLanguage)}>
            {languages.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
