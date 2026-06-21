import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Mountain, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../hooks/useI18n'
import { LANGUAGES, APP_NAME } from '../../lib/constants'
import { supabase } from '../../lib/supabase'
import type { AppLanguage } from '../../lib/types'

function isValidLang(val: string): val is AppLanguage {
  return val === 'es' || val === 'en'
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const heroVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

// ─── Google SVG Icon ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        fill="#FFC107"
      />
      <path
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        fill="#FF3D00"
      />
      <path
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        fill="#4CAF50"
      />
      <path
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        fill="#1976D2"
      />
    </svg>
  )
}

// ─── Main Auth Screen ─────────────────────────────────────────────────────────

export function AuthScreen() {
  const { t, language } = useI18n()
  const { configured } = useAuth()
  const { setLanguage } = useTheme()

  function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (isValidLang(val)) setLanguage(val)
  }

  async function handleGoogleLogin() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/app' },
    })
  }

  const tagline =
    language === 'es'
      ? 'La fusión de Strava y TrainingPeaks, con un coach de IA'
      : 'The Strava + TrainingPeaks fusion, with an AI coach'

  const stravaNote =
    language === 'es'
      ? 'Conecta tu cuenta de Strava después de iniciar sesión para importar tus datos de entrenamiento'
      : 'Connect your Strava account after signing in to import your training data'

  return (
    <div className="auth-screen">
      {/* ─── Left: Branding / Hero ─────────────────────────────────────── */}
      <motion.div
        className="auth-hero"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="auth-hero-content">
          <div className="auth-hero-logo">
            <Mountain size={36} strokeWidth={1.5} />
            <span className="auth-hero-app-name">{APP_NAME}</span>
          </div>

          <h1 className="auth-hero-tagline">{tagline}</h1>

          <div className="auth-hero-features">
            <div className="auth-hero-feature">
              <Activity size={18} />
              <span>
                {language === 'es'
                  ? 'Planificación multi-deporte inteligente'
                  : 'Smart multi-sport planning'}
              </span>
            </div>
            <div className="auth-hero-feature">
              <Mountain size={18} />
              <span>
                {language === 'es'
                  ? 'Análisis de carga CTL/ATL/TSB'
                  : 'CTL/ATL/TSB load analysis'}
              </span>
            </div>
            <div className="auth-hero-feature">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <path d="M12 18v4" />
              </svg>
              <span>
                {language === 'es'
                  ? 'Coach IA que ajusta tu plan cada día'
                  : 'AI Coach that tunes your plan daily'}
              </span>
            </div>
          </div>

          <div className="auth-hero-visual">
            <div className="auth-hero-gradient" />
          </div>
        </div>
      </motion.div>

      {/* ─── Right: Auth Form ──────────────────────────────────────────── */}
      <div className="auth-form-side">
        {/* Language switcher */}
        <motion.header
          className="auth-top-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label className="auth-lang-switch">
            <Globe size={14} />
            <select value={language} onChange={handleLangChange}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </motion.header>

        <motion.div
          className="auth-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="auth-card-inner"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div className="auth-card-header" variants={itemVariants}>
              <div className="auth-card-logo-mobile">
                <Mountain size={28} strokeWidth={1.5} />
              </div>
              <h2>{t('authTitle')}</h2>
              <p>{t('authSubtitle')}</p>
            </motion.div>

            {!configured ? (
              <motion.div className="auth-warning" variants={itemVariants}>
                <p>{t('notConfigured')}</p>
                <code>VITE_SUPABASE_URL</code>
                <code>VITE_SUPABASE_ANON_KEY</code>
              </motion.div>
            ) : (
              <>
                {/* Google OAuth — Primary */}
                <motion.button
                  type="button"
                  className="auth-btn-google"
                  onClick={handleGoogleLogin}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GoogleIcon />
                  <span>
                    {language === 'es'
                      ? 'Continuar con Google'
                      : 'Continue with Google'}
                  </span>
                </motion.button>

                {/* Strava note */}
                <motion.div className="auth-strava-note" variants={itemVariants}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10.5 2L7 9h2.5L7 16l7-9h-3l2.5-5h-3z"
                      fill="#FC4C02"
                    />
                  </svg>
                  <span>{stravaNote}</span>
                </motion.div>

                {/* Divider */}
                <motion.div className="auth-divider" variants={itemVariants}>
                  <span>{t('orContinueWith')}</span>
                </motion.div>

                {/* Email/Password — Collapsible */}
                <motion.div variants={itemVariants}>
                  <EmailSection />
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Footer links */}
          <motion.footer
            className="auth-card-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/privacy">
              {language === 'es' ? 'Privacidad' : 'Privacy'}
            </Link>
            <span className="auth-footer-dot">·</span>
            <Link to="/terms">
              {language === 'es' ? 'Términos' : 'Terms'}
            </Link>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Collapsible Email/Password Section ───────────────────────────────────────

function EmailSection() {
  const { language } = useI18n()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="auth-email-section">
      {!expanded ? (
        <button
          type="button"
          className="auth-btn-expand-email"
          onClick={() => setExpanded(true)}
        >
          {language === 'es' ? 'Usar correo electrónico' : 'Use email'}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <PasswordForm />
        </motion.div>
      )}
    </div>
  )
}

// ─── Password Form ────────────────────────────────────────────────────────────

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

    const { signInWithPassword, signUpWithPassword } = await import(
      '../../lib/auth'
    )
    const result = isSignUp
      ? await signUpWithPassword(email, password)
      : await signInWithPassword(email, password)

    setLoading(false)
    if (!result.ok) setError(result.message)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
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
      <label className="auth-field">
        <span>{t('password')}</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          minLength={6}
        />
      </label>
      {error && <div className="auth-form-error">{error}</div>}
      <motion.button
        type="submit"
        className="auth-btn-submit"
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? t('sending') : isSignUp ? t('signUp') : t('signIn')}
      </motion.button>
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
