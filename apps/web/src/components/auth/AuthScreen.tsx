import { Globe } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { appBrand, languages } from '../../lib/ui'
import type { AppLanguage } from '../../lib/types'
import peakLogo from '../../assets/peak-logo.png'
import { MagicLinkForm } from './MagicLinkForm'

type Props = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

export function AuthScreen({ language, setLanguage }: Props) {
  const { configured } = useAuth()

  return (
    <div className="signin-shell">
      <div className="signin-panel">
        <div className="brand-lockup">
          <img src={peakLogo} alt={appBrand.name} className="brand-logo signin-logo" />
        </div>

        <h1>{appBrand.name}</h1>
        <p>Tu panel de rendimiento para planificar, ajustar y optimizar cada semana.</p>

        {configured ? (
          <MagicLinkForm />
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
