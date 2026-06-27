import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  User, CreditCard, Bot, Palette, Globe, Activity as ActivityIcon,
  ShieldCheck, FileText, LogOut, Check, ExternalLink, Pencil, Trash2,
  Trophy, Lock, Sparkles, Camera, Bell, BellOff, RefreshCw, Gift, Zap,
} from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useApiKey } from '../hooks/useApiKey'
import { useStripe } from '../hooks/useStripe'
import { useStravaConnection } from '../hooks/useStrava'
import { useGamification } from '../hooks/useGamification'
import { signOut } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { THEMES, LANGUAGES, ACCENT_COLORS } from '../lib/constants'
import type { AccentColor, AppLanguage, ThemeMode } from '../lib/types'
import type { I18nKey } from '../lib/i18n'
import { CoachOrb } from '../components/ui/CoachOrb'
import type { OrbMood } from '../components/ui/CoachOrb'

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

function PromoCodeBox({ onSuccess, isEs }: { onSuccess: () => void; isEs: boolean }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleRedeem() {
    const normalized = code.trim().toUpperCase()
    if (!normalized) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (!supabase) throw new Error('Supabase no configurado')
      const { data, error: fnErr } = await supabase.rpc('validate_and_redeem_promo_code', {
        p_code: normalized,
        p_profile_id: (await supabase.auth.getUser()).data.user?.id ?? '',
      })
      if (fnErr) throw fnErr
      const result = data as { success: boolean; error?: string; message?: string; tier?: string }
      if (result.success) {
        setSuccess(result.message ?? (isEs ? '¡Código canjeado con éxito!' : 'Code redeemed successfully!'))
        setCode('')
        onSuccess()
      } else {
        setError(result.error ?? (isEs ? 'Código inválido' : 'Invalid code'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEs ? 'Error al canjear código' : 'Error redeeming code'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="promo-code-box">
      <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
        {isEs
          ? 'Si tienes un código de regalo, ingrésalo aquí para activar Premium.'
          : 'If you have a gift code, enter it here to activate Premium.'}
      </p>
      <div className="promo-input-row">
        <input
          type="text"
          className="input-field promo-input"
          placeholder={isEs ? 'Ej: PEAK-GIFT-3M' : 'E.g. PEAK-GIFT-3M'}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={30}
          disabled={loading}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRedeem() }}
        />
        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
        >
          {loading ? '...' : (isEs ? 'Canjear' : 'Redeem')}
        </button>
      </div>
      {error && <p className="error-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>{error}</p>}
      {success && <p className="success-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>{success}</p>}
    </div>
  )
}

export function Profile() {
  const { t } = useI18n()
  const { theme, setTheme, language: lang, setLanguage, accentColor, setAccentColor } = useTheme()
  const { profile, configured, refresh } = useAuth()
  const { subscription, usage, isPro, isPremium, isSubscriber, loading: subLoading, refetch: refetchSub } = useSubscription()
  const { keyData, hasKey, saving, validating, error: keyError, saveKey, deleteKey } = useApiKey()
  const { checkout, openPortal, loading: stripeLoading, error: stripeError } = useStripe()
  const { status: strava, loading: stravaLoading } = useStravaConnection()
  const gamification = useGamification()

  const isEs = lang === 'es'
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

  // ── Avatar upload ─────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile || !supabase) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `avatars/${profile.id}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadErr && !uploadErr.message?.includes('bucket')) throw uploadErr
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
      await refresh()
    } catch (err) {
      console.error('[avatar] upload error:', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const orbMood: OrbMood = gamification.unlockedCount === gamification.achievements.length && gamification.achievements.length > 0
    ? 'celebrate'
    : 'idle'

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

  const quotaPct = Math.min(100, ((usage?.usedQueries ?? 0) / (usage?.limit ?? 20)) * 100)

  return (
    <div className="page-profile">
      <div className="page-header">
        <h2>{isEs ? 'Perfil' : 'Profile'}</h2>
      </div>

      {/* ── Profile hero — photo + name + quick stats ─────────────────────── */}
      <motion.section
        className="profile-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="profile-hero-bg" aria-hidden />

        {/* Photo — centered, clickable to upload */}
        <div className="profile-photo-wrap">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="profile-photo-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label={isEs ? 'Cambiar foto de perfil' : 'Change profile photo'}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="profile-photo-img" />
            ) : (
              <div className="profile-photo-placeholder">
                {(profile?.display_name ?? 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-photo-overlay">
              {uploadingAvatar ? (
                <span className="avatar-upload-spinner" />
              ) : (
                <Camera size={22} />
              )}
            </div>
          </button>
        </div>

        {/* Name — clickable to edit inline */}
        <div className="profile-name-row">
          {editingName ? (
            <div className="profile-name-edit">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="profile-name-input"
                autoFocus
                maxLength={60}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
              />
              <button type="button" className="btn-primary btn-sm" onClick={saveName} disabled={savingName || !nameInput.trim()}>
                {savingName ? '...' : (isEs ? 'Guardar' : 'Save')}
              </button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setEditingName(false)}>
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button type="button" className="profile-name-btn" onClick={startEditName} title={isEs ? 'Editar nombre' : 'Edit name'}>
              <h3 className="profile-name-text">
                {profile?.display_name ?? (isEs ? 'Atleta' : 'Athlete')}
              </h3>
              <Pencil size={14} className="profile-name-pencil" />
            </button>
          )}
        </div>

        {/* Tagline */}
        <p className="profile-tagline">
          {isEs
            ? `Nivel ${gamification.level} · ${gamification.levelTitle} · ${gamification.xp} XP`
            : `Level ${gamification.level} · ${gamification.levelTitle} · ${gamification.xp} XP`}
        </p>

        {/* Quick stats */}
        <div className="profile-hero-stats">
          <div className="profile-hero-stat">
            <small>{isEs ? 'Logros' : 'Achievements'}</small>
            <strong>{gamification.unlockedCount}/{gamification.achievements.length}</strong>
          </div>
          <div className="profile-hero-stat">
            <small>{isEs ? 'Plan' : 'Plan'}</small>
            <strong>{isPremium ? 'Premium' : isPro ? 'Pro' : 'Free'}</strong>
          </div>
          <div className="profile-hero-stat">
            <small>{isEs ? 'Consultas IA' : 'AI queries'}</small>
            <strong>{usage?.usedQueries ?? 0}/{usage?.limit ?? 20}</strong>
          </div>
        </div>
      </motion.section>

      {/* ── Gamification — level + achievements ────────────────────────────── */}
      <motion.section
        className="card level-card level-card-orb"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <div className="card-header">
          <Trophy size={16} />
          <span>{isEs ? 'Nivel y logros' : 'Level & achievements'}</span>
          <span className="level-count">{gamification.unlockedCount}/{gamification.achievements.length}</span>
        </div>

        <div className="level-top">
          <div className="level-badge">
            <span className="level-num">{gamification.level}</span>
          </div>
          <div className="level-info">
            <strong>{gamification.levelTitle}</strong>
            <div className="level-bar">
              <motion.div
                className="level-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(gamification.levelProgress * 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <small className="text-muted">{gamification.xpInLevel} / {gamification.xpForNextLevel} XP · {gamification.xp} XP {isEs ? 'totales' : 'total'}</small>
          </div>
        </div>

        <div className="achievements-grid">
          {gamification.achievements.map((a, i) => (
            <motion.div
              key={a.id}
              className={`achievement${a.unlocked ? ' unlocked' : ''}`}
              title={a.desc}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <span className="achievement-emoji">{a.unlocked ? a.emoji : <Lock size={16} />}</span>
              <span className="achievement-title">{a.title}</span>
              {!a.unlocked && a.progress > 0 && (
                <span className="achievement-progress">
                  <span style={{ width: `${Math.round(a.progress * 100)}%` }} />
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Account ────────────────────────────────────────────────────────── */}
      {profile && (
        <Section icon={<User size={16} />} title={isEs ? 'Cuenta' : 'Account'}>
          <div className="settings-profile">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title={isEs ? 'Cambiar foto' : 'Change photo'}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="avatar-lg avatar-img" />
              ) : (
                <div className="avatar-lg">{(profile.display_name ?? 'A').charAt(0).toUpperCase()}</div>
              )}
              <div className="avatar-upload-overlay">
                {uploadingAvatar ? (
                  <span className="avatar-upload-spinner" />
                ) : (
                  <Camera size={18} />
                )}
              </div>
            </button>
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
            <span className={`plan-badge ${isPremium ? 'premium' : isPro ? 'pro' : 'free'}`}>
              {isPremium ? 'Premium' : isPro ? t('proPlan') : t('freePlan')}
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

      {/* ── Subscription ───────────────────────────────────────────────────── */}
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
            </div>

            {!isSubscriber ? (
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
                {isPremium && (
                  <div className="plan-premium-badge">
                    <Sparkles size={14} />
                    <span>{isEs ? 'Premium activo' : 'Premium active'}</span>
                    {subscription?.currentPeriodEnd && (
                      <span className="plan-premium-expiry">
                        {isEs ? 'hasta' : 'until'} {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: isPremium ? 8 : 0 }}>
                  <button type="button" className="btn-outline" onClick={openPortal} disabled={stripeLoading}>
                    {isEs ? 'Gestionar suscripción' : 'Manage subscription'}
                  </button>
                </div>
                {subscription?.currentPeriodEnd && (
                  <p className="text-muted" style={{ fontSize: '0.82rem', marginTop: 8 }}>
                    {isEs ? 'Próximo cobro:' : 'Next billing:'}{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── Promo code ──────────────────────────────────────────────────────── */}
      <Section icon={<Gift size={16} />} title={isEs ? 'Canjear código' : 'Redeem code'}>
        <PromoCodeBox onSuccess={refetchSub} isEs={isEs} />
      </Section>

      {/* ── AI Coach config ────────────────────────────────────────────────── */}
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
                  target="_blank" rel="noopener noreferrer"
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

      {/* ── Appearance ─────────────────────────────────────────────────────── */}
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
        <select value={lang} onChange={handleLangChange} className="settings-select">
          {LANGUAGES.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
        </select>
      </Section>

      {/* ── System status ──────────────────────────────────────────────────── */}
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

      {/* ── Notifications preferences ────────────────────────────────────────── */}
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

      {/* ── Legal ──────────────────────────────────────────────────────────── */}
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

      {/* ── Reset onboarding ───────────────────────────────────────────────── */}
      <Section icon={<RefreshCw size={16} />} title={isEs ? 'Reiniciar onboarding' : 'Reset onboarding'}>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          {isEs
            ? '¿Quieres volver a configurar tu perfil desde cero? Esto no borra tus datos, solo te permite repetir el cuestionario inicial.'
            : 'Want to reconfigure your profile from scratch? This doesn\'t delete your data, it just lets you redo the initial questionnaire.'}
        </p>
        <button
          type="button"
          className="btn-secondary"
          style={{ width: '100%' }}
          onClick={() => {
            if (profile?.id) {
              localStorage.removeItem(`peak_onboarding_done_${profile.id}`)
            }
            window.location.href = '/app'
          }}
        >
          <RefreshCw size={14} />
          {isEs ? 'Reiniciar cuestionario inicial' : 'Restart initial questionnaire'}
        </button>
      </Section>
    </div>
  )
}
