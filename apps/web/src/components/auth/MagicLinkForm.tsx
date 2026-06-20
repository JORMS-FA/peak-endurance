import { useState } from 'react'
import type { FormEvent } from 'react'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { sendMagicLink } from '../../lib/auth'
import { useI18n } from '../../hooks/useI18n'

export function MagicLinkForm() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)

    const result = await sendMagicLink(email)
    setSending(false)

    if (!result.ok) {
      setError(result.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="form-success">
        <CheckCircle2 size={24} />
        <p>{t('magicLinkSent')}</p>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label className="form-field">
        <span>{t('email')}</span>
        <div className="input-with-icon">
          <Mail size={16} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />
        </div>
      </label>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="btn-primary" disabled={sending}>
        <span>{sending ? t('sending') : t('sendMagicLink')}</span>
        <ArrowRight size={16} />
      </button>
    </form>
  )
}
