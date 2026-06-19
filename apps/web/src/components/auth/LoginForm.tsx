import { useState } from 'react'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Mode = 'login' | 'register'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    if (!supabase) {
      setError('Supabase no está configurado.')
      return
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Ingresa un correo válido.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        if (signInError) {
          setError(signInError.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos.'
            : signInError.message)
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { emailRedirectTo: window.location.origin }
        })
        if (signUpError) {
          setError(signUpError.message)
        } else {
          setMessage('Cuenta creada. Revisa tu correo para confirmar.')
        }
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setMessage(null)
    setError(null)
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-field">
        <span>Correo electrónico</span>
        <div className="login-input">
          <Mail size={16} aria-hidden />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
      </label>

      <label className="login-field">
        <span>Contraseña</span>
        <div className="login-input">
          <Lock size={16} aria-hidden />
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
          />
        </div>
      </label>

      <button type="submit" className="primary-button full-width" disabled={loading}>
        {loading ? (
          <><Loader2 size={18} className="spin" /> {mode === 'login' ? 'Iniciando sesión…' : 'Creando cuenta…'}</>
        ) : (
          mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
        )}
      </button>

      {error ? <p className="login-message is-error">{error}</p> : null}
      {message ? <p className="login-message is-success">{message}</p> : null}

      <button type="button" className="link-btn" onClick={toggleMode}>
        {mode === 'login'
          ? '¿No tienes cuenta? Regístrate'
          : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </form>
  )
}
