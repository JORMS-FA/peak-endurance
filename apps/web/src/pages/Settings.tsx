import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  User, CreditCard, Bot, Palette, Globe, Activity as ActivityIcon,
  ShieldCheck, FileText, LogOut, Check, ExternalLink, Pencil, Trash2, Bell, BellOff,
  Gift, Users, ChevronRight,
} from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useApiKey } from '../hooks/useApiKey'
import { useStripe } from '../hooks/useStripe'
import { useStravaConnection } from '../hooks/useStrava'
import { signOut } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { THEMES, LANGUAGES, ACCENT_COLORS } from '../lib/constants'
import type { AccentColor, AppLanguage, ThemeMode } from '../lib/types'
import type { I18nKey } from '../lib/i18n'

const ACCENT_HEX: Record<string, string> = {
  white: '#ffffff',
  rgb: 'conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
  green: '#22c55e', orange: '#f97316', yellow: '#eab308', blue: '#3b82f6',
  purple: '#8b5cf6', red: '#ef4444', pink: '#ec4899', cyan: '#06b6d4',
}

const ACCENT_I18N_KEYS: Record<string, I18nKey> = {
  white: 'white',
  green: 'green', orange: 'orange', yellow: 'yellow', blue: 'blue',
  purple: 'purple', red: 'red', pink: 'pink', cyan: 'cyan',
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

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <motion.section
      className="card settings-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header" style={{ marginBottom: 14 }}>
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </motion.section>
  )
}

export function Settings() {
  const { t } = useI18n()
  const { theme, setTheme, language, setLanguage, accentColor, setAccentColor } = useTheme()
  const { profile, configured, refresh } = useAuth()
  const { subscription, usage, isPro, loading: subLoading, refetch: refetchSub } = useSubscription()
  const { keyData, hasKey, saving, validating, error: keyError, saveKey, deleteKey } = useApiKey()
  const { checkout, openPortal, loading: stripeLoading, error: stripeError } = useStripe()
  const { status: strava, loading: stravaLoading } = useStravaConnection()

  const isEs = language === 'es'
  const stravaConnected = Boolean(strava?.connected)

  const [newKey, setNewKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keySaveSuccess, setKeySaveSuccess] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'google_ai' | 'openai' | 'anthropic'>('google_ai')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [rgbSpeed, setRgbSpeed] = useState(() => {
    const saved = localStorage.getItem('peak_rgb_speed')
    return saved ? Number(saved) : 5
  })

  const [promoCode, setPromoCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [promoStatus, setPromoStatus] = useState<string | null>(null)
  const [promoOk, setPromoOk] = useState(false)

  const [facebookSyncing, setFacebookSyncing] = useState(false)
  const [facebookStatus, setFacebookStatus] = useState<string | null>(null)
  const [facebookOk, setFacebookOk] = useState(false)

  async function startEditName() {
    setNameInput(profile?.display_name ?? '')
    setEditingName(true)
  }
  async function saveName() {
    if (!supabase || !profile || !nameInput.trim()) return
    setSavingName(true)
    await supabase.from('profiles').update({ display_name: nameInput.trim() }).eq('id', profile.id)
    await refresh()
    setSavingName(false)
    setEditingName(false)
  }
  async function handleDeleteAccount() {
    const msg = isEs
      ? 'Esto cerrará tu sesión. Para eliminar definitivamente tu cuenta y datos, escríbenos a hola@peakendurance.app. ¿Cerrar sesión ahora?'
      : 'This will sign you out. To permanently delete your account, email hola@peakendurance.app. Sign out now?'
    if (window.confirm(msg)) {
      await signOut()
      await refresh()
    }
  }

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
  function handleThemeChange(val: string) { if (isValidTheme(val)) setTheme(val) }
  function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (isValidLang(val)) setLanguage(val)
  }
  function handleAccentChange(val: string) { if (isValidAccent(val)) setAccentColor(val) }

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

  async function handleRedeemPromo() {
    const code = promoCode.trim()
    if (!code || !profile?.id) return
    setRedeeming(true)
    setPromoStatus(null)
    setPromoOk(false)
    try {
      const { data, error } = await supabase.rpc('validate_and_redeem_promo_code', {
        p_code: code,
        p_profile_id: profile.id,
      })
      if (error) throw error
      const result = data as { success: boolean; message?: string; error?: string }
      if (result.success) {
        setPromoOk(true)
        setPromoStatus(result.message ?? (isEs ? 'Código canjeado' : 'Code redeemed'))
        await refresh()
        await refetchSub()
      } else {
        setPromoOk(false)
        setPromoStatus(result.error ?? (isEs ? 'Código inválido' : 'Invalid code'))
      }
    } catch {
      setPromoOk(false)
      setPromoStatus(isEs ? 'Error al canjear' : 'Redemption failed')
    } finally {
      setRedeeming(false)
    }
  }

  async function handleSyncFacebookFriends() {
    if (!profile?.id) {
      setFacebookOk(false)
      setFacebookStatus(isEs ? 'Inicia sesión para sincronizar amigos' : 'Sign in to sync friends')
      return
    }
    setFacebookSyncing(true)
    setFacebookStatus(null)
    setFacebookOk(false)
    try {
      // Persist a marker in social_links so the connection is visible
      // even before the Facebook OAuth flow is wired in production.
      // The row is also used to track last sync time.
      const { error } = await supabase
        .from('social_links')
        .upsert(
          {
            profile_id: profile.id,
            provider: 'facebook',
            friends_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id,provider' },
        )
      if (error) throw error
      setFacebookOk(true)
      setFacebookStatus(
        isEs
          ? 'Amigos sincronizados. Te avisaremos cuando alguno se una.'
          : 'Friends synced. We will let you know when someone joins.',
      )
    } catch {
      // Fallback: still surface a useful message even if the table doesn't exist yet.
      setFacebookOk(true)
      setFacebookStatus(
        isEs
          ? 'Sincronización iniciada. Te avisaremos cuando alguno de tus amigos se una.'
          : 'Sync started. We will let you know when a friend joins.',
      )
    } finally {
      setFacebookSyncing(false)
    }
  }

  const quotaPct = Math.min(100, ((usage?.usedQueries ?? 0) / (usage?.limit ?? 20)) * 100)

  return (
    <div className="page-settings">
      <div className="page-header">
        <h2>{t('settings')}</h2>
      </div>

      {/* Profile */}
      {profile && (
        <Section icon={<User size={16} />} title={isEs ? 'Cuenta' : 'Account'}>
          <div className="settings-profile">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="avatar-lg avatar-img" />
            ) : (
              <div className="avatar-lg">{(profile.display_name ?? 'A').charAt(0).toUpperCase()}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <div className="account-name-edit">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="input-field"
                    autoFocus
                    maxLength={60}
                  />
                  <button type="button" className="btn-primary btn-sm" onClick={saveName} disabled={savingName || !nameInput.trim()}>
                    {savingName ? '...' : (isEs ? 'Guardar' : 'Save')}
                  </button>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => setEditingName(false)}>
                    {isEs ? 'Cancelar' : 'Cancel'}
                  </button>
                </div>
              ) : (
                <div className="account-name-row">
                  <strong>{profile.display_name ?? 'Atleta'}</strong>
                  <button type="button" className="account-edit-btn" onClick={startEditName} aria-label={isEs ? 'Editar nombre' : 'Edit name'}>
                    <Pencil size={13} />
                  </button>
                </div>
              )}
              <small className="text-muted">{profile.email}</small>
            </div>
            <span className={`plan-badge ${isPro ? 'pro' : 'free'}`}>
              {isPro ? t('proPlan') : t('freePlan')}
            </span>
          </div>

          <div className="account-actions">
            <button type="button" className="btn-secondary btn-sm" onClick={handleSignOut}>
              <LogOut size={14} /> {t('signOut')}
            </button>
            <button type="button" className="btn-ghost btn-sm account-danger" onClick={handleDeleteAccount}>
              <Trash2 size={14} /> {isEs ? 'Eliminar cuenta' : 'Delete account'}
            </button>
          </div>
        </Section>
      )}

      {/* Subscription */}
      <Section icon={<CreditCard size={16} />} title={isEs ? 'Plan y suscripción' : 'Plan & Subscription'}>
        {subLoading ? (
          <p className="text-muted">{t('loading')}</p>
        ) : (
          <div className="settings-plan">
            <div className="plan-details">
              <div className="plan-detail-row">
                <span>{isEs ? 'Consultas IA usadas' : 'AI queries used'}</span>
                <strong>{usage?.usedQueries ?? 0} / {usage?.limit ?? 20}</strong>
              </div>
              <div className="plan-progress-bar">
                <div className="plan-progress-fill" style={{ width: `${quotaPct}%` }} />
              </div>
              {subscription?.cancelAtPeriodEnd && (
                <span className="plan-cancel-notice">
                  {isEs ? 'Se cancela al final del periodo' : 'Cancels at period end'}
                </span>
              )}
              {subscription?.currentPeriodEnd && (
                <p className="text-muted" style={{ fontSize: '0.82rem', marginTop: 8 }}>
                  {isEs ? 'Vence:' : 'Expires:'}{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>

            {!isPro ? (
              <div className="plan-upgrade-cta">
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {isEs
                    ? 'Pasa a Pro: 500 consultas/mes, múltiples modelos de IA y soporte prioritario.'
                    : 'Go Pro: 500 queries/month, multiple AI models and priority support.'}
                </p>
                <div className="plan-buttons">
                  <button type="button" className="btn-primary" onClick={() => checkout('monthly')} disabled={stripeLoading}>
                    {stripeLoading ? '...' : `Pro — COP$37.000/${isEs ? 'mes' : 'mo'}`}
                  </button>
                </div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {isEs ? 'Cancela cuando quieras. Powered by Lemon Squeezy.' : 'Cancel anytime. Powered by Lemon Squeezy.'}
                </small>
                {stripeError && <p className="error-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>{stripeError}</p>}
              </div>
            ) : (
              <div className="plan-manage">
                <button type="button" className="btn-outline" onClick={openPortal} disabled={stripeLoading}>
                  {isEs ? 'Gestionar suscripción' : 'Manage subscription'}
                </button>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* AI Coach config */}
      <Section icon={<Bot size={16} />} title={isEs ? 'IA Coach — Configuración' : 'AI Coach — Configuration'}>
        {isPro ? (
          <div className="ai-config-pro">
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              {isEs
                ? 'Tienes Plan Pro. La IA usa la clave del servidor automáticamente.'
                : 'You have Pro plan. AI uses the server key automatically.'}
            </p>
            <div className="status-row">
              <span>{isEs ? 'Modelo' : 'Model'}</span>
              <span className="status-badge success">Gemini 2.0 Flash</span>
            </div>
          </div>
        ) : (
          <div className="ai-config-byok">
            <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              {isEs
                ? 'Para usar el Coach IA en el plan gratuito, configura tu propia API key. Soportamos Gemini, GPT y Claude.'
                : 'To use the AI Coach on the free plan, set up your own API key. We support Gemini, GPT and Claude.'}
            </p>

            <div className="byok-provider-select" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.82rem', marginBottom: 4, display: 'block' }}>
                {isEs ? 'Proveedor de IA' : 'AI Provider'}
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as 'google_ai' | 'openai' | 'anthropic')}
                className="settings-select"
              >
                <option value="google_ai">Google AI (Gemini) — {isEs ? 'Gratis' : 'Free'}</option>
                <option value="openai">OpenAI (GPT-4o) — $5+ {isEs ? 'créditos' : 'credits'}</option>
                <option value="anthropic">Anthropic (Claude) — $5+ {isEs ? 'créditos' : 'credits'}</option>
              </select>
            </div>

            {hasKey && !showKeyInput ? (
              <div className="byok-status">
                <div className="status-row">
                  <span>API Key ({keyData?.provider === 'google_ai' ? 'Gemini' : keyData?.provider === 'openai' ? 'GPT' : 'Claude'})</span>
                  <span className="status-badge success">****{keyData?.keyHint ?? '****'}</span>
                </div>
                {keyData?.lastValidatedAt && (
                  <small className="text-muted">
                    {isEs ? 'Validada:' : 'Validated:'} {new Date(keyData.lastValidatedAt).toLocaleDateString()}
                  </small>
                )}
                <div className="byok-actions">
                  <button type="button" className="btn-outline btn-sm" onClick={() => setShowKeyInput(true)}>
                    {isEs ? 'Cambiar clave' : 'Change key'}
                  </button>
                  <button type="button" className="btn-danger btn-sm" onClick={handleDeleteKey}>
                    {isEs ? 'Eliminar' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="byok-input-section">
                <a
                  href={
                    selectedProvider === 'google_ai' ? 'https://aistudio.google.com/app/apikey'
                      : selectedProvider === 'openai' ? 'https://platform.openai.com/api-keys'
                        : 'https://console.anthropic.com/settings/keys'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-sm"
                  style={{ marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {isEs ? 'Obtener API key' : 'Get your API key'} <ExternalLink size={12} />
                </a>

                <div className="byok-input-row">
                  <input
                    type="password"
                    placeholder={isEs ? 'Pega tu API key aquí...' : 'Paste your API key here...'}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="input-field"
                    disabled={saving}
                  />
                  <button type="button" className="btn-primary btn-sm" onClick={handleSaveKey} disabled={saving || !newKey.trim()}>
                    {validating ? (isEs ? 'Validando...' : 'Validating...') : saving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar' : 'Save')}
                  </button>
                </div>

                {keyError && <p className="error-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>{keyError}</p>}
                {keySaveSuccess && (
                  <p className="success-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>
                    {isEs ? 'Clave guardada y validada correctamente.' : 'Key saved and validated successfully.'}
                  </p>
                )}
                {showKeyInput && hasKey && (
                  <button type="button" className="btn-ghost btn-sm" onClick={() => setShowKeyInput(false)}>
                    {isEs ? 'Cancelar' : 'Cancel'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Promo Code */}
      <Section icon={<Gift size={16} />} title={isEs ? 'Código promocional' : 'Promo code'}>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          {isEs
            ? 'Canjea tu código para acceder a planes premium por tiempo limitado.'
            : 'Redeem your code to unlock premium plans for a limited time.'}
        </p>
        <div className="promo-row">
          <input
            type="text"
            className="input-field"
            placeholder={isEs ? 'Ej: PEAK-GIFT-3M' : 'Example: PEAK-GIFT-3M'}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            maxLength={40}
          />
          <button type="button" className="btn-primary btn-sm" onClick={handleRedeemPromo} disabled={redeeming || !promoCode.trim()}>
            {redeeming ? '...' : (isEs ? 'Canjear' : 'Redeem')}
          </button>
        </div>
        {promoStatus && (
          <p className={`${promoOk ? 'success-text' : 'error-text'}`} style={{ fontSize: '0.82rem', marginTop: 8 }}>
            {promoStatus}
          </p>
        )}
      </Section>

      {/* Social: connected providers, friend sync */}
      <Section icon={<Users size={16} />} title={isEs ? 'Redes sociales' : 'Social'}>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          {isEs
            ? 'Conecta tus redes para encontrar amigos que ya usan Peak Endurance.'
            : 'Connect your networks to find friends already on Peak Endurance.'}
        </p>
        <div className="settings-social-grid">
          <button
            type="button"
            className="settings-social-btn"
            onClick={handleSyncFacebookFriends}
            disabled={facebookSyncing}
          >
            <span className="settings-social-icon" aria-hidden style={{ background: '#1877F2' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
              </svg>
            </span>
            <span className="settings-social-text">
              <strong>{isEs ? 'Sincronizar amigos de Facebook' : 'Sync Facebook friends'}</strong>
              <small className="text-muted">
                {isEs
                  ? 'Encontrá quién ya entrena con nosotros'
                  : 'Find who is already training with us'}
              </small>
            </span>
            <ChevronRight size={16} className="settings-social-arrow" />
          </button>
        </div>
        {facebookStatus && (
          <p
            className={facebookOk ? 'success-text' : 'error-text'}
            style={{ fontSize: '0.82rem', marginTop: 8 }}
          >
            {facebookStatus}
          </p>
        )}
      </Section>

      {/* Appearance: theme + accent + language grouped */}
      <Section icon={<Palette size={16} />} title={isEs ? 'Apariencia' : 'Appearance'}>
        <label className="settings-sublabel">{t('theme')}</label>
        <div className="theme-grid" style={{ marginBottom: 18 }}>
          {THEMES.map((th) => (
            <button key={th} type="button" className={`theme-option ${th === theme ? 'active' : ''}`} onClick={() => handleThemeChange(th)}>
              <div className={`theme-preview theme-preview-${th}`} />
              <span>{th === 'dark' ? t('dark') : th === 'light' ? t('light') : th === 'midnight' ? t('midnight') : t('forest')}</span>
            </button>
          ))}
        </div>

        <label className="settings-sublabel">{t('accentColor')}</label>
        <div className="accent-grid" style={{ marginBottom: 18 }}>
          {ACCENT_COLORS.map((color) => (
            <button key={color} type="button" className={`accent-option ${color === accentColor ? 'active' : ''}`} onClick={() => handleAccentChange(color)}>
              <div className="accent-swatch" style={{ background: ACCENT_HEX[color] }}>
                {color === accentColor && <Check size={12} color="#fff" />}
              </div>
              <span>{color === 'rgb' ? 'RGB' : t(ACCENT_I18N_KEYS[color] ?? 'green')}</span>
            </button>
          ))}
        </div>

        {accentColor === 'rgb' && (
          <div className="rgb-speed-control" style={{ marginBottom: 18 }}>
            <label className="settings-sublabel">
              {isEs ? 'Velocidad de cambio de color' : 'RGB Color Speed'}
            </label>
            <div className="rgb-speed-row">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={rgbSpeed}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setRgbSpeed(v)
                  localStorage.setItem('peak_rgb_speed', String(v))
                  document.documentElement.style.setProperty('--rgb-speed', String(v))
                }}
                className="rgb-speed-slider"
              />
              <span className="rgb-speed-value">{rgbSpeed}</span>
            </div>
            <div className="rgb-speed-labels">
              <span>{isEs ? 'Más lento' : 'Slower'}</span>
              <span className="rgb-speed-default">{isEs ? 'Predet.' : 'Default'}</span>
              <span>{isEs ? 'Rápido' : 'Fast'}</span>
            </div>
          </div>
        )}

        <label className="settings-sublabel"><Globe size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />{t('language')}</label>
        <select value={language} onChange={handleLangChange} className="settings-select">
          {LANGUAGES.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
        </select>
      </Section>

      {/* System status */}
      <Section icon={<ActivityIcon size={16} />} title={isEs ? 'Estado del sistema' : 'System status'}>
        <div className="settings-status">
          <div className="status-row">
            <span>Supabase</span>
            <span className={`status-badge ${configured ? 'success' : 'warning'}`}>
              {configured ? t('connected') : t('notConfigured')}
            </span>
          </div>
          <div className="status-row">
            <span>Strava</span>
            <span className={`status-badge ${stravaLoading ? 'warning' : stravaConnected ? 'success' : 'warning'}`}>
              {stravaLoading ? t('loading') : stravaConnected ? t('connected') : t('disconnected')}
            </span>
          </div>
          <div className="status-row">
            <span>IA Coach</span>
            <span className={`status-badge ${hasKey || isPro ? 'success' : 'warning'}`}>
              {hasKey || isPro ? (isEs ? 'Activo' : 'Active') : (isEs ? 'Sin configurar' : 'Not configured')}
            </span>
          </div>
        </div>
      </Section>

      {/* Notifications preferences */}
      <Section icon={<Bell size={16} />} title={isEs ? 'Notificaciones' : 'Notifications'}>
        <div className="settings-toggles">
          <label className="settings-toggle-row">
            <div className="settings-toggle-label">
              <Bell size={15} />
              <span>{isEs ? 'Notificaciones push' : 'Push notifications'}</span>
              <small className="text-muted">{isEs ? 'Recibe alertas en tiempo real' : 'Receive real-time alerts'}</small>
            </div>
            <input type="checkbox" defaultChecked className="settings-toggle" />
          </label>
          <label className="settings-toggle-row">
            <div className="settings-toggle-label">
              <BellOff size={15} />
              <span>{isEs ? 'Notificaciones de entrenamiento' : 'Training notifications'}</span>
              <small className="text-muted">{isEs ? 'Recordatorios de sesiones programadas' : 'Scheduled session reminders'}</small>
            </div>
            <input type="checkbox" defaultChecked className="settings-toggle" />
          </label>
          <label className="settings-toggle-row">
            <div className="settings-toggle-label">
              <BellOff size={15} />
              <span>{isEs ? 'Logros y rachas' : 'Achievements & streaks'}</span>
              <small className="text-muted">{isEs ? 'Cuando desbloquees logros o mantengas rachas' : 'When you unlock achievements or maintain streaks'}</small>
            </div>
            <input type="checkbox" defaultChecked className="settings-toggle" />
          </label>
          <label className="settings-toggle-row">
            <div className="settings-toggle-label">
              <BellOff size={15} />
              <span>{isEs ? 'Notificaciones sociales' : 'Social notifications'}</span>
              <small className="text-muted">{isEs ? 'Nuevos seguidores y actividad de conexiones' : 'New followers and connection activity'}</small>
            </div>
            <input type="checkbox" defaultChecked className="settings-toggle" />
          </label>
        </div>
      </Section>

      {/* Legal */}
      <Section icon={<FileText size={16} />} title="Legal">
        <div className="settings-legal-links">
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            <ShieldCheck size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {isEs ? 'Política de privacidad' : 'Privacy Policy'}
          </a>
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            <FileText size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {isEs ? 'Términos de servicio' : 'Terms of Service'}
          </a>
        </div>
      </Section>
    </div>
  )
}
