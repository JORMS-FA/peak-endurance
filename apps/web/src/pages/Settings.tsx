import { useState, useEffect } from 'react'
import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useApiKey } from '../hooks/useApiKey'
import { useStripe } from '../hooks/useStripe'
import { signOut } from '../lib/auth'
import { THEMES, LANGUAGES, ACCENT_COLORS } from '../lib/constants'
import type { AccentColor, AppLanguage, ThemeMode } from '../lib/types'
import type { I18nKey } from '../lib/i18n'

const ACCENT_HEX: Record<string, string> = {
  green: '#22c55e',
  orange: '#f97316',
  yellow: '#eab308',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  red: '#ef4444',
  pink: '#ec4899',
  cyan: '#06b6d4',
}

const ACCENT_I18N_KEYS: Record<string, I18nKey> = {
  green: 'green',
  orange: 'orange',
  yellow: 'yellow',
  blue: 'blue',
  purple: 'purple',
  red: 'red',
  pink: 'pink',
  cyan: 'cyan',
}

function isValidTheme(val: string): val is ThemeMode {
  return ['dark', 'light', 'midnight', 'forest'].includes(val)
}

function isValidLang(val: string): val is AppLanguage {
  return val === 'es' || val === 'en'
}

function isValidAccent(val: string): val is AccentColor {
  return ACCENT_COLORS.includes(val)
}

export function Settings() {
  const { t } = useI18n()
  const { theme, setTheme, language, setLanguage, accentColor, setAccentColor } = useTheme()
  const { profile, configured, refresh } = useAuth()
  const { subscription, usage, isPro, loading: subLoading, refetch: refetchSub } = useSubscription()
  const { keyData, hasKey, saving, validating, error: keyError, saveKey, deleteKey } = useApiKey()
  const { checkout, openPortal, loading: stripeLoading, error: stripeError } = useStripe()

  const [newKey, setNewKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keySaveSuccess, setKeySaveSuccess] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'google_ai' | 'openai' | 'anthropic'>('google_ai')

  // Check for upgrade success from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgrade') === 'success') {
      refetchSub()
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [refetchSub])

  async function handleSignOut() {
    await signOut()
    await refresh()
  }

  function handleThemeChange(val: string) {
    if (isValidTheme(val)) setTheme(val)
  }

  function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (isValidLang(val)) setLanguage(val)
  }

  function handleAccentChange(val: string) {
    if (isValidAccent(val)) setAccentColor(val)
  }

  async function handleSaveKey() {
    if (!newKey.trim()) return
    const success = await saveKey(newKey.trim(), selectedProvider)
    if (success) {
      setNewKey('')
      setShowKeyInput(false)
      setKeySaveSuccess(true)
      setTimeout(() => setKeySaveSuccess(false), 3000)
    }
  }

  async function handleDeleteKey() {
    await deleteKey()
    setShowKeyInput(false)
  }

  return (
    <div className="page-settings">
      <div className="page-header">
        <h2>{t('settings')}</h2>
      </div>

      {/* Profile */}
      {profile && (
        <section className="card settings-section">
          <h3>{t('profile')}</h3>
          <div className="settings-profile">
            <div className="avatar-lg">
              {(profile.display_name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{profile.display_name ?? 'Atleta'}</strong>
              <small>{profile.email}</small>
            </div>
          </div>
        </section>
      )}

      {/* Subscription / Plan */}
      <section className="card settings-section">
        <h3>{language === 'es' ? 'Plan y suscripcion' : 'Plan & Subscription'}</h3>
        {subLoading ? (
          <p className="text-muted">{t('loading')}</p>
        ) : (
          <div className="settings-plan">
            <div className="plan-badge-row">
              <span className={`plan-badge ${isPro ? 'pro' : 'free'}`}>
                {isPro ? t('proPlan') : t('freePlan')}
              </span>
              {subscription?.cancelAtPeriodEnd && (
                <span className="plan-cancel-notice">
                  {language === 'es' ? 'Se cancela al final del periodo' : 'Cancels at period end'}
                </span>
              )}
            </div>

            <div className="plan-details">
              <div className="plan-detail-row">
                <span>{language === 'es' ? 'Consultas IA usadas' : 'AI queries used'}</span>
                <strong>{usage?.usedQueries ?? 0} / {usage?.limit ?? 20}</strong>
              </div>
              <div className="plan-progress-bar">
                <div
                  className="plan-progress-fill"
                  style={{ width: `${Math.min(100, ((usage?.usedQueries ?? 0) / (usage?.limit ?? 20)) * 100)}%` }}
                />
              </div>
            </div>

            {!isPro && (
              <div className="plan-upgrade-cta">
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {language === 'es'
                    ? 'Upgrade a Pro para 500 consultas/mes, multiples modelos IA y soporte prioritario.'
                    : 'Upgrade to Pro for 500 queries/month, multiple AI models and priority support.'}
                </p>
                <div className="plan-buttons">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => checkout('monthly')}
                    disabled={stripeLoading}
                  >
                    {stripeLoading ? '...' : `Pro — COP$37.000/${language === 'es' ? 'mes' : 'mo'}`}
                  </button>
                </div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {language === 'es' ? 'Cancela cuando quieras. Powered by Lemon Squeezy.' : 'Cancel anytime. Powered by Lemon Squeezy.'}
                </small>
                {stripeError && (
                  <p className="error-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>{stripeError}</p>
                )}
              </div>
            )}

            {isPro && (
              <div className="plan-manage">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={openPortal}
                  disabled={stripeLoading}
                >
                  {language === 'es' ? 'Gestionar suscripcion' : 'Manage subscription'}
                </button>
                {subscription?.currentPeriodEnd && (
                  <p className="text-muted" style={{ fontSize: '0.82rem', marginTop: 8 }}>
                    {language === 'es' ? 'Proximo cobro:' : 'Next billing:'}{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* AI Coach — BYOK Configuration */}
      <section className="card settings-section">
        <h3>{language === 'es' ? 'IA Coach — Configuracion' : 'AI Coach — Configuration'}</h3>

        {isPro ? (
          <div className="ai-config-pro">
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              {language === 'es'
                ? 'Tienes Plan Pro. La IA usa la clave del servidor automaticamente. No necesitas configurar nada.'
                : 'You have Pro plan. AI uses the server key automatically. No configuration needed.'}
            </p>
            <div className="status-row">
              <span>{language === 'es' ? 'Modelo' : 'Model'}</span>
              <span className="status-badge success">Gemini 2.0 Flash</span>
            </div>
          </div>
        ) : (
          <div className="ai-config-byok">
            <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              {language === 'es'
                ? 'Para usar el Coach IA en el plan gratuito, configura tu propia API key. Soportamos Gemini, GPT y Claude.'
                : 'To use the AI Coach on the free plan, set up your own API key. We support Gemini, GPT and Claude.'}
            </p>

            {/* Provider selector */}
            <div className="byok-provider-select" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.82rem', marginBottom: 4, display: 'block' }}>
                {language === 'es' ? 'Proveedor de IA' : 'AI Provider'}
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as 'google_ai' | 'openai' | 'anthropic')}
                className="settings-select"
              >
                <option value="google_ai">Google AI (Gemini) — {language === 'es' ? 'Gratis' : 'Free'}</option>
                <option value="openai">OpenAI (GPT-4o) — $5+ {language === 'es' ? 'creditos' : 'credits'}</option>
                <option value="anthropic">Anthropic (Claude) — $5+ {language === 'es' ? 'creditos' : 'credits'}</option>
              </select>
            </div>

            {hasKey && !showKeyInput ? (
              <div className="byok-status">
                <div className="status-row">
                  <span>API Key ({keyData?.provider === 'google_ai' ? 'Gemini' : keyData?.provider === 'openai' ? 'GPT' : 'Claude'})</span>
                  <span className="status-badge success">
                    ****{keyData?.keyHint ?? '****'}
                  </span>
                </div>
                {keyData?.lastValidatedAt && (
                  <small className="text-muted">
                    {language === 'es' ? 'Validada:' : 'Validated:'}{' '}
                    {new Date(keyData.lastValidatedAt).toLocaleDateString()}
                  </small>
                )}
                <div className="byok-actions">
                  <button type="button" className="btn-outline btn-sm" onClick={() => setShowKeyInput(true)}>
                    {language === 'es' ? 'Cambiar clave' : 'Change key'}
                  </button>
                  <button type="button" className="btn-danger btn-sm" onClick={handleDeleteKey}>
                    {language === 'es' ? 'Eliminar' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="byok-input-section">
                <a
                  href={
                    selectedProvider === 'google_ai'
                      ? 'https://aistudio.google.com/app/apikey'
                      : selectedProvider === 'openai'
                        ? 'https://platform.openai.com/api-keys'
                        : 'https://console.anthropic.com/settings/keys'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-sm"
                  style={{ marginBottom: 10, display: 'inline-block' }}
                >
                  {language === 'es' ? 'Obtener API key' : 'Get your API key'} ({
                    selectedProvider === 'google_ai' ? 'Google AI Studio'
                      : selectedProvider === 'openai' ? 'OpenAI'
                        : 'Anthropic'
                  }) ↗
                </a>

                <div className="byok-input-row">
                  <input
                    type="password"
                    placeholder={language === 'es' ? 'Pega tu API key aqui...' : 'Paste your API key here...'}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="input-field"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={handleSaveKey}
                    disabled={saving || !newKey.trim()}
                  >
                    {validating
                      ? (language === 'es' ? 'Validando...' : 'Validating...')
                      : saving
                        ? (language === 'es' ? 'Guardando...' : 'Saving...')
                        : (language === 'es' ? 'Guardar' : 'Save')}
                  </button>
                </div>

                {keyError && (
                  <p className="error-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>
                    {keyError}
                  </p>
                )}
                {keySaveSuccess && (
                  <p className="success-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>
                    {language === 'es' ? 'Clave guardada y validada correctamente.' : 'Key saved and validated successfully.'}
                  </p>
                )}

                {showKeyInput && hasKey && (
                  <button type="button" className="btn-ghost btn-sm" onClick={() => setShowKeyInput(false)}>
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Theme */}
      <section className="card settings-section">
        <h3>{t('theme')}</h3>
        <div className="theme-grid">
          {THEMES.map((th) => (
            <button
              key={th}
              type="button"
              className={`theme-option ${th === theme ? 'active' : ''}`}
              onClick={() => handleThemeChange(th)}
            >
              <div className={`theme-preview theme-preview-${th}`} />
              <span>{th === 'dark' ? t('dark') : th === 'light' ? t('light') : th === 'midnight' ? t('midnight') : t('forest')}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Accent Color */}
      <section className="card settings-section">
        <h3>{t('accentColor')}</h3>
        <div className="accent-grid">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`accent-option ${color === accentColor ? 'active' : ''}`}
              onClick={() => handleAccentChange(color)}
            >
              <div
                className="accent-swatch"
                style={{ background: ACCENT_HEX[color] }}
              />
              <span>{t(ACCENT_I18N_KEYS[color] ?? 'green')}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="card settings-section">
        <h3>{t('language')}</h3>
        <div className="settings-row">
          <select
            value={language}
            onChange={handleLangChange}
            className="settings-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* System Status */}
      <section className="card settings-section">
        <h3>{language === 'es' ? 'Estado del sistema' : 'System status'}</h3>
        <div className="settings-status">
          <div className="status-row">
            <span>Supabase</span>
            <span className={`status-badge ${configured ? 'success' : 'warning'}`}>
              {configured ? t('connected') : t('notConfigured')}
            </span>
          </div>
          <div className="status-row">
            <span>Strava</span>
            <span className="status-badge warning">{t('disconnected')}</span>
          </div>
          <div className="status-row">
            <span>IA Coach</span>
            <span className={`status-badge ${hasKey || isPro ? 'success' : 'warning'}`}>
              {hasKey || isPro
                ? (language === 'es' ? 'Activo' : 'Active')
                : (language === 'es' ? 'Sin configurar' : 'Not configured')}
            </span>
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="card settings-section">
        <h3>{language === 'es' ? 'Legal' : 'Legal'}</h3>
        <div className="settings-legal-links">
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            {language === 'es' ? 'Politica de privacidad' : 'Privacy Policy'}
          </a>
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            {language === 'es' ? 'Terminos de servicio' : 'Terms of Service'}
          </a>
        </div>
      </section>

      <button type="button" className="btn-danger" onClick={handleSignOut}>
        {t('signOut')}
      </button>
    </div>
  )
}
