import { Globe, ShieldCheck, Sparkles } from 'lucide-react'
import { MagicLinkForm } from './MagicLinkForm'
import peakLogo from '../../assets/peak-logo.png'
import type { AppLanguage } from '../../lib/types'
import { t } from '../../lib/i18n'
import { languages } from '../../lib/ui'

export type AuthScreenProps = {
  configured: boolean
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

export function AuthScreen({ configured, language, setLanguage }: AuthScreenProps) {
  const copy = (key: Parameters<typeof t>[1]) => t(language, key)

  return (
    <div className="auth-shell">
      <header className="auth-topbar">
        <img src={peakLogo} alt="Peak Endurance" className="auth-logo" />
        <label className="auth-lang">
          <Globe size={16} aria-hidden="true" />
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as AppLanguage)}
            aria-label={copy('language')}
          >
            {languages.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main className="auth-main">
        <section className="auth-hero">
          <span className="auth-tag">{copy('authTagline')}</span>
          <h1>{copy('authTitle')}</h1>
          <p>{copy('authSubtitle')}</p>

          <ul className="auth-bullets">
            <li>
              <Sparkles size={16} aria-hidden="true" />
              <span>{copy('authBulletAi')}</span>
            </li>
            <li>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{copy('authBulletPrivacy')}</span>
            </li>
          </ul>
        </section>

        <section className="auth-card">
          <header>
            <h2>{copy('authCardTitle')}</h2>
            <p>{copy('authCardHint')}</p>
          </header>
          <MagicLinkForm
            configured={configured}
            configuredLabel={copy('authNotConfigured')}
            emailLabel={copy('authEmailLabel')}
            emailPlaceholder={copy('authEmailPlaceholder')}
            submitLabel={copy('authSubmit')}
            successHeadline={copy('authSuccessHeadline')}
            successHint={copy('authSuccessHint')}
            invalidEmailMessage={copy('authInvalidEmail')}
          />
        </section>

        <footer className="auth-foot">
          <small>{copy('authTerms')}</small>
        </footer>
      </main>
    </div>
  )
}