import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, CheckCircle2, Mail, TriangleAlert } from 'lucide-react'
import { getSiteUrl } from '../../providers/AuthProvider'
import { sendMagicLink } from '../../lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type MagicLinkFormProps = {
  configured: boolean
  configuredLabel: string
  emailLabel: string
  emailPlaceholder: string
  submitLabel: string
  successHeadline: string
  successHint: string
  invalidEmailMessage: string
  defaultEmail?: string
}

export function MagicLinkForm({
  configured,
  configuredLabel,
  emailLabel,
  emailPlaceholder,
  submitLabel,
  successHeadline,
  successHint,
  invalidEmailMessage,
  defaultEmail = '',
}: MagicLinkFormProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!configured) {
      setError('Supabase no está configurado en este entorno.')
      return
    }
    const trimmed = email.trim()
    if (!EMAIL_REGEX.test(trimmed)) {
      setError(invalidEmailMessage)
      return
    }
    setSending(true)
    setError(null)
    const result = await sendMagicLink(trimmed, getSiteUrl())
    setSending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="magic-success" role="status">
        <div className="magic-success-icon" aria-hidden="true">
          <CheckCircle2 size={28} />
        </div>
        <div className="magic-success-copy">
          <strong>{successHeadline}</strong>
          <small>{successHint.replace('{email}', email.trim())}</small>
        </div>
      </div>
    )
  }

  return (
    <form className="magic-form" onSubmit={onSubmit} noValidate>
      <label className="magic-label">
        <span>{emailLabel}</span>
        <div className="magic-input">
          <Mail size={18} aria-hidden="true" />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={!configured || sending}
            required
          />
        </div>
      </label>

      {!configured ? (
        <div className="magic-warning">
          <TriangleAlert size={16} aria-hidden="true" />
          <span>{configuredLabel}</span>
        </div>
      ) : null}

      {error ? (
        <div className="magic-error" role="alert">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="magic-submit"
        disabled={!configured || sending}
      >
        <span>{sending ? 'Enviando…' : submitLabel}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  )
}