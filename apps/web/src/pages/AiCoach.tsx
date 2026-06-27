import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Lock, Sparkles, Send, CalendarPlus, Check, KeyRound, X, Mic, Plus, Image, Camera, Paperclip } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import { useStravaConnection } from '../hooks/useStrava'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { useSubscription } from '../hooks/useSubscription'
import { useApiKey } from '../hooks/useApiKey'
import { useAiChat } from '../hooks/useAiCoach'
import { useStripe } from '../hooks/useStripe'
import { SportIcon } from '../components/ui/SportIcon'
import { useAuth } from '../hooks/useAuth'
import { CoachOrb } from '../components/ui/CoachOrb'
import type { OrbMood } from '../components/ui/CoachOrb'

export function AiCoach() {
  const { t, language } = useI18n()
  const { profile } = useAuth()
  const { status: strava, loading: stravaLoading } = useStravaConnection()
  const { metrics, hasData } = useDashboardMetrics()
  const { isPro } = useSubscription()
  const { hasKey } = useApiKey()
  const { checkout, loading: stripeLoading } = useStripe()
  const { messages, send, loading: chatLoading, error: chatError } = useAiChat()
  const [chatInput, setChatInput] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallInterval, setPaywallInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [attachOpen, setAttachOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const stravaConnected = Boolean(strava?.connected)
  const canUseAi = hasKey || isPro

  // Only block if Strava or activities missing (show inline). Key/sub is handled via paywall popup.
  const blockedBanner = !stravaLoading && !stravaConnected
    ? 'aiBlockedNoStrava'
    : !hasData
      ? 'aiBlockedNoActivities'
      : null

  const orbMood: OrbMood = chatError ? 'tired' : chatLoading ? 'thinking' : 'idle'

  function buildContext() {
    return {
      ctl: metrics.ctl,
      atl: metrics.atl,
      tsb: metrics.tsb,
      weeklyHours: metrics.weeklyHours,
      weeklyDistance: metrics.weeklyDistance ?? 0,
      recentActivities: (metrics.recent ?? []).slice(0, 10).map((a) => ({
        date: a.date,
        sport: a.sport,
        duration_minutes: a.duration_minutes ?? 0,
        tss: a.tss ?? 0,
        title: a.title,
      })),
    }
  }

  async function handleSendChat(e?: React.FormEvent) {
    e?.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    // If blocked by Strava/activities, don't send
    if (blockedBanner) return

    // If no access (not pro, no key), show paywall instead of sending
    if (!canUseAi) {
      setShowPaywall(true)
      return
    }

    const msg = chatInput
    setChatInput('')
    await send(msg, buildContext())
    requestAnimationFrame(() => {
      chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Stub: will process file + send to AI
    setChatInput((prev) => prev + ` [📎 ${file.name}]`)
    setAttachOpen(false)
  }

  function handleVoiceToggle() {
    // Stub: will integrate STT
    setIsRecording((prev) => !prev)
  }

  const isEs = language === 'es'
  const price = paywallInterval === 'monthly' ? 'COP$30.000' : 'COP$300.000'
  const per = paywallInterval === 'monthly' ? (isEs ? '/mes' : '/mo') : (isEs ? '/año' : '/yr')
  const features = isEs
    ? ['500 consultas de IA al mes', 'Chat ilimitado con el coach', 'Planes generados por IA', 'Sin anuncios', 'Soporte prioritario']
    : ['500 AI queries / month', 'Unlimited coach chat', 'AI-generated plans', 'No ads', 'Priority support']

  return (
    <div className="page-ai">
      {/* Hero — compact orb + greeting */}
      <motion.section
        className="ai-hero ai-hero-bot orb-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="orb-hero-rgb-wash" aria-hidden />
        <CoachOrb size={72} mood={orbMood} thinking={chatLoading} />
        <div className="ai-hero-text orb-hero-body">
          <span className="ai-hero-eyebrow"><Sparkles size={12} /> PEAK IA COACH</span>
          <h3>
            {isEs ? 'Hola' : 'Hi'}
            {profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''} 👋
          </h3>
          <p>
            {isEs
              ? 'Soy tu coach. Pregúntame, analizo tu carga y te creo entrenamientos al instante.'
              : "I'm your coach. Ask me, I analyze your load and build workouts instantly."}
          </p>
        </div>
      </motion.section>

      {/* Blocked banner (Strava / activities) */}
      {blockedBanner && (
        <motion.div
          className="card ai-blocked"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Lock size={16} />
          <div className="ai-blocked-body">
            <strong>{t('aiBlockedTitle')}</strong>
            <small>{t(blockedBanner as 'aiBlockedNoStrava')}</small>
          </div>
        </motion.div>
      )}

      {/* ── Chat (fills remaining height) ──────────────────────────── */}
      <motion.section
        className="ai-chat-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {/* Messages */}
        <div className="ai-chat-box" ref={chatBoxRef}>
          {messages.length === 0 ? (
            <div className="ai-chat-empty">
              <div className="ai-chat-empty-icon">
                <Sparkles size={28} strokeWidth={1.5} />
              </div>
              <p>
                {isEs
                  ? 'Pregúntame lo que quieras o pídeme crear un entrenamiento.'
                  : 'Ask me anything or ask me to create a workout.'}
              </p>
              <div className="ai-chat-suggestions">
                <button type="button" className="ai-suggestion-chip" onClick={() => { setChatInput(isEs ? 'Prográmame un rodaje suave de 40 min mañana' : 'Schedule an easy 40-min run tomorrow') }}>
                  {isEs ? '🟢 Rodaje suave 40 min' : '🟢 Easy 40-min run'}
                </button>
                <button type="button" className="ai-suggestion-chip" onClick={() => { setChatInput(isEs ? 'Crea series 5x1000 el sábado' : 'Create 5x1000 intervals Saturday') }}>
                  {isEs ? '🔴 Series 5x1000' : '🔴 5x1000 intervals'}
                </button>
                <button type="button" className="ai-suggestion-chip" onClick={() => { setChatInput(isEs ? '¿Cómo está mi fatiga esta semana?' : 'How is my fatigue this week?') }}>
                  {isEs ? '📊 Mi fatiga esta semana' : '📊 My fatigue this week'}
                </button>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-msg-${m.role}`}>
                <div className="ai-msg-bubble">{m.content}</div>
                {m.createdSession && (
                  <div className="ai-session-created">
                    <div className="ai-session-icon" data-sport={m.createdSession.sport}>
                      <SportIcon sport={m.createdSession.sport} size={16} />
                    </div>
                    <div className="ai-session-body">
                      <div className="ai-session-top">
                        <CalendarPlus size={13} />
                        <strong>{m.createdSession.title}</strong>
                      </div>
                      <small>
                        {m.createdSession.session_date}
                        {m.createdSession.duration_minutes ? ` · ${m.createdSession.duration_minutes} min` : ''}
                        {m.createdSession.intensity ? ` · ${m.createdSession.intensity}` : ''}
                        {m.createdSession.tss ? ` · ${m.createdSession.tss} TSS` : ''}
                      </small>
                    </div>
                    <span className="status-badge success">{isEs ? 'Programado' : 'Scheduled'}</span>
                  </div>
                )}
              </div>
            ))
          )}
          {chatLoading && (
            <div className="ai-msg ai-msg-assistant">
              <div className="ai-msg-bubble ai-msg-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          {chatError && (
            <div className="form-error" style={{ margin: '8px 0' }}>{chatError}</div>
          )}
        </div>

        {/* Input — WhatsApp/Telegram style */}
        <form className="ai-chat-input" onSubmit={handleSendChat}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* Attach button (+ icon) */}
          <div className="ai-attach-wrap">
            <button
              type="button"
              className="ai-input-btn ai-attach-btn"
              onClick={() => setAttachOpen((o) => !o)}
              disabled={Boolean(blockedBanner) || chatLoading}
              aria-label={isEs ? 'Adjuntar archivo' : 'Attach file'}
            >
              <Plus size={22} strokeWidth={1.5} />
            </button>

            {/* Attachment menu dropdown */}
            <AnimatePresence>
              {attachOpen && (
                <motion.div
                  className="ai-attach-menu"
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <button type="button" onClick={() => { fileInputRef.current?.click(); setAttachOpen(false) }}>
                    <Image size={18} />
                    <span>{isEs ? 'Foto o video' : 'Photo & video'}</span>
                  </button>
                  <button type="button" onClick={() => { fileInputRef.current?.click(); setAttachOpen(false) }}>
                    <Camera size={18} />
                    <span>{isEs ? 'Cámara' : 'Camera'}</span>
                  </button>
                  <button type="button" onClick={() => { fileInputRef.current?.click(); setAttachOpen(false) }}>
                    <Paperclip size={18} />
                    <span>{isEs ? 'Archivo' : 'Document'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text input */}
          <input
            type="text"
            className="ai-text-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={
              blockedBanner
                ? (isEs ? 'Conecta Strava para chatear...' : 'Connect Strava to chat...')
                : (isEs ? 'Escribe un mensaje...' : 'Type a message...')
            }
            disabled={Boolean(blockedBanner) || chatLoading}
          />

          {/* Voice / Send toggle */}
          {chatInput.trim() ? (
            <button
              type="submit"
              className="ai-input-btn ai-send-btn"
              disabled={Boolean(blockedBanner) || chatLoading}
              aria-label={isEs ? 'Enviar' : 'Send'}
            >
              <Send size={18} />
            </button>
          ) : (
            <button
              type="button"
              className={`ai-input-btn ai-mic-btn${isRecording ? ' recording' : ''}`}
              onClick={handleVoiceToggle}
              disabled={Boolean(blockedBanner) || chatLoading}
              aria-label={isEs ? 'Grabar audio' : 'Record audio'}
            >
              <Mic size={20} />
            </button>
          )}
        </form>
      </motion.section>

      {/* ── Paywall Popup Overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            className="paywall-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaywall(false)}
          >
            <motion.div
              className="paywall-popup"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="paywall-popup-close" onClick={() => setShowPaywall(false)}>
                <X size={18} />
              </button>

              <div className="paywall-popup-header">
                <span className="paywall2-badge">PRO</span>
                <strong>{isEs ? 'Desbloquea tu coach de IA' : 'Unlock your AI coach'}</strong>
              </div>

              <div className="paywall-popup-toggle">
                <button type="button" className={paywallInterval === 'monthly' ? 'active' : ''} onClick={() => setPaywallInterval('monthly')}>
                  {isEs ? 'Mensual' : 'Monthly'}
                </button>
                <button type="button" className={paywallInterval === 'yearly' ? 'active' : ''} onClick={() => setPaywallInterval('yearly')}>
                  {isEs ? 'Anual' : 'Annual'}
                  <span className="paywall2-save">−17%</span>
                </button>
              </div>

              <div className="paywall-popup-price">
                <strong>{price}</strong><span>{per}</span>
              </div>

              <ul className="paywall-popup-features">
                {features.map((f) => (<li key={f}><Check size={14} /> {f}</li>))}
              </ul>

              <button
                type="button"
                className="paywall2-cta paywall-popup-cta"
                onClick={() => checkout(paywallInterval)}
                disabled={stripeLoading}
              >
                <Sparkles size={15} />
                {stripeLoading ? '...' : isEs ? 'Empezar con Pro' : 'Start with Pro'}
              </button>

              <Link to="/app/perfil" className="paywall2-byok" onClick={() => setShowPaywall(false)}>
                <KeyRound size={13} /> {isEs ? 'o usa tu API key gratis' : 'or use your API key free'}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
