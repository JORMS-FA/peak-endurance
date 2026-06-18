import { useState } from 'react'
import { Mail } from 'lucide-react'
import { getSiteUrl } from '../../providers/AuthProvider'
import { sendMagicLink } from '../../lib/auth'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setStatus('error')
      setMessage('Ingresa un correo válido.')
      return
    }
    setStatus('sending')
    setMessage(null)
    const result = await sendMagicLink(trimmed, getSiteUrl())
    if (result.ok) {
      setStatus('sent')
      setMessage('Te enviamos un enlace mágico. Revisa tu bandeja de entrada.')
    } else {
      setStatus('error')
      setMessage(result.message ?? 'No pudimos enviar el enlace. Intenta de nuevo.')
    }
  }

  const disabled = status === 'sending'

  return (
    <form className="magic-link-form" onSubmit={handleSubmit}>
      <label className="magic-link-field">
        <span>Correo electrónico</span>
        <div className="magic-link-input">
          <Mail size={16} aria-hidden />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </label>

      <button type="submit" className="primary-button full-width" disabled={disabled}>
        {status === 'sending' ? 'Enviando enlace…' : 'Enviar enlace mágico'}
      </button>

      {message ? (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          className={`magic-link-message${status === 'error' ? ' is-error' : ' is-success'}`}
        >
          {message}
        </p>
      ) : null}

      <p className="magic-link-hint">
        Sin contraseñas. Te enviaremos un enlace seguro para entrar a Peak Endurance.
      </p>
    </form>
  )
}
