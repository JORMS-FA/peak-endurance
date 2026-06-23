import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Lock, Shield, Sparkles, Zap, CheckCircle, AlertTriangle, X, Send, CalendarPlus } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useStravaConnection } from '../hooks/useStrava'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { useSubscription } from '../hooks/useSubscription'
import { useApiKey } from '../hooks/useApiKey'
import { useAiCoach, useAiChat } from '../hooks/useAiCoach'
import type { AiAction } from '../hooks/useAiCoach'
import { SportIcon } from '../components/ui/SportIcon'
import { useAuth } from '../hooks/useAuth'
import { CoachBot } from '../components/ui/CoachBot'
import { Paywall } from '../components/ui/Paywall'

type ActionKey = 'analyzeWeek' | 'adjustPlan' | 'detectFatigue'

const ACTION_MAP: Record<ActionKey, AiAction> = {
  analyzeWeek: 'analyze_week',
  adjustPlan: 'adjust_plan',
  detectFatigue: 'detect_fatigue',
}

export function AiCoach() {
  const { t, language } = useI18n()
  const { profile } = useAuth()
  const { status: strava } = useStravaConnection()
  const { metrics, hasData } = useDashboardMetrics()
  const { usage, isPro } = useSubscription()
  const { hasKey } = useApiKey()
  const { execute, loading: aiLoading, result: aiResult, error: aiError, reset } = useAiCoach()
  const { messages, send, loading: chatLoading, error: chatError } = useAiChat()
  const [pickedAction, setPickedAction] = useState<ActionKey | null>(null)
  const [chatInput, setChatInput] = useState('')
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const stravaConnected = Boolean(strava?.connected)
  const canUseAi = hasKey || isPro
  const blockedReason = !stravaConnected
    ? 'aiBlockedNoStrava'
    : !hasData
      ? 'aiBlockedNoActivities'
      : !canUseAi
        ? 'aiBlockedNoKey'
        : null

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
    if (!chatInput.trim() || chatLoading || blockedReason) return
    const msg = chatInput
    setChatInput('')
    await send(msg, buildContext())
    requestAnimationFrame(() => {
      chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  const actions: { key: ActionKey; icon: ReactNode; descKey: string }[] = [
    { key: 'analyzeWeek', icon: <Sparkles size={20} />, descKey: 'aiAnalyzeDesc' },
    { key: 'adjustPlan', icon: <Zap size={20} />, descKey: 'aiAdjustDesc' },
    { key: 'detectFatigue', icon: <Shield size={20} />, descKey: 'aiFatigueDesc' },
  ]

  async function handleExecute() {
    if (!pickedAction || blockedReason) return
    await execute(ACTION_MAP[pickedAction], buildContext())
  }

  return (
    <div className="page-ai">
      <div className="page-header">
        <h2>{t('aiCoach')}</h2>
        <span className="badge">Beta</span>
      </div>

      {/* Hero — animated bot + modern greeting */}
      <motion.section
        className="ai-hero ai-hero-bot"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <CoachBot size={96} thinking={chatLoading} />
        <div className="ai-hero-text">
          <span className="ai-hero-eyebrow"><Sparkles size={12} /> PEAK IA COACH</span>
          <h3>
            {language === 'es' ? 'Hola' : 'Hi'}
            {profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''} 👋
          </h3>
          <p>
            {language === 'es'
              ? 'Soy tu coach. Pregúntame, analizo tu carga y te creo entrenamientos al instante.'
              : "I'm your coach. Ask me, I analyze your load and build workouts instantly."}
          </p>
        </div>
      </motion.section>

      {/* Paywall when locked by subscription / missing key */}
      {blockedReason === 'aiBlockedNoKey' && <Paywall />}

      {/* Blocked banner (Strava / activities) */}
      {blockedReason && blockedReason !== 'aiBlockedNoKey' && (
        <motion.div
          className="card ai-blocked"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Lock size={16} />
          <div className="ai-blocked-body">
            <strong>{t('aiBlockedTitle')}</strong>
            <small>
              {blockedReason === 'aiBlockedNoKey'
                ? (language === 'es'
                  ? 'Configura tu API key de Google AI Studio en Ajustes para usar el coach.'
                  : 'Set up your Google AI Studio API key in Settings to use the coach.')
                : t(blockedReason as 'aiBlockedNoStrava')}
            </small>
          </div>
          {blockedReason === 'aiBlockedNoStrava' && (
            <Link to="/app/conexiones" className="btn-primary btn-sm">
              {t('connectStrava')}
            </Link>
          )}
          {blockedReason === 'aiBlockedNoKey' && (
            <Link to="/app/ajustes" className="btn-primary btn-sm">
              {language === 'es' ? 'Configurar' : 'Configure'}
            </Link>
          )}
        </motion.div>
      )}

      {/* ── Chat con el coach ──────────────────────────────────────────── */}
      <motion.section
        className="card ai-chat"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="card-header">
          <Bot size={16} />
          <span>{language === 'es' ? 'Chatea con tu coach' : 'Chat with your coach'}</span>
        </div>

        <div className="ai-chat-box" ref={chatBoxRef}>
          {messages.length === 0 ? (
            <div className="ai-chat-empty">
              <Sparkles size={20} />
              <p>
                {language === 'es'
                  ? 'Pregúntame lo que quieras o pídeme crear un entrenamiento. Ej: "Prográmame un rodaje suave de 40 min mañana" o "Crea series 5x1000 el sábado".'
                  : 'Ask me anything or tell me to create a workout. E.g. "Schedule an easy 40-min run tomorrow".'}
              </p>
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
                    <span className="status-badge success">{language === 'es' ? 'Programado' : 'Scheduled'}</span>
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
        </div>

        {chatError && (
          <div className="form-error" style={{ marginTop: 8 }}>{chatError}</div>
        )}

        <form className="ai-chat-input" onSubmit={handleSendChat}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={
              blockedReason
                ? (language === 'es' ? 'Conecta Strava y configura la IA para chatear' : 'Connect Strava and set up AI to chat')
                : (language === 'es' ? 'Escribe un mensaje o un comando...' : 'Type a message or command...')
            }
            disabled={Boolean(blockedReason) || chatLoading}
          />
          <button type="submit" className="btn-primary" disabled={Boolean(blockedReason) || chatLoading || !chatInput.trim()}>
            <Send size={16} />
          </button>
        </form>
      </motion.section>

      {/* Action cards */}
      <div className="ai-actions-grid">
        {actions.map((a, i) => {
          const disabled = blockedReason !== null || aiLoading
          return (
            <motion.button
              key={a.key}
              type="button"
              className={`ai-action-card${pickedAction === a.key ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
              onClick={() => !disabled && setPickedAction(a.key)}
              disabled={disabled}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={disabled ? undefined : { y: -2 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
            >
              {a.icon}
              <strong>{t(a.key)}</strong>
              <small>{t(a.descKey as 'aiAnalyzeDesc')}</small>
              {disabled && !aiLoading && <span className="ai-locked-badge"><Lock size={10} /> {t('locked')}</span>}
            </motion.button>
          )
        })}
      </div>

      {/* Execute button */}
      {pickedAction && !blockedReason && !aiResult && (
        <motion.div
          className="ai-execute-section"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            type="button"
            className="btn-primary btn-lg"
            onClick={handleExecute}
            disabled={aiLoading}
          >
            {aiLoading
              ? (language === 'es' ? 'Analizando...' : 'Analyzing...')
              : (language === 'es' ? 'Ejecutar analisis' : 'Run analysis')}
          </button>
        </motion.div>
      )}

      {/* AI Error */}
      <AnimatePresence>
        {aiError && (
          <motion.div
            className="card ai-error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AlertTriangle size={16} />
            <div>
              <strong>{aiError.error === 'quota_exceeded'
                ? (language === 'es' ? 'Cuota agotada' : 'Quota exceeded')
                : (language === 'es' ? 'Error' : 'Error')}</strong>
              <p style={{ fontSize: '0.82rem' }}>{aiError.message ?? aiError.error}</p>
            </div>
            <button type="button" className="btn-ghost btn-sm" onClick={reset}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Result */}
      <AnimatePresence>
        {aiResult && (
          <motion.section
            className="card ai-result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="card-header">
              <CheckCircle size={14} />
              <span>{t(pickedAction ?? 'analyzeWeek')}</span>
              <button type="button" className="btn-ghost btn-sm" onClick={reset} style={{ marginLeft: 'auto' }}>
                <X size={14} />
              </button>
            </div>
            <AiResultDisplay data={aiResult.result} language={language} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Live context */}
      {hasData && !aiResult && (
        <motion.section
          className="card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-header">
            <Bot size={14} />
            <span>{t('aiContext')}</span>
          </div>
          <div className="ai-context-grid">
            <div>
              <small>CTL</small>
              <strong>{metrics.ctl}</strong>
            </div>
            <div>
              <small>ATL</small>
              <strong>{metrics.atl}</strong>
            </div>
            <div>
              <small>TSB</small>
              <strong>{metrics.tsb}</strong>
            </div>
            <div>
              <small>{t('weeklyHours')}</small>
              <strong>{metrics.weeklyHours.toFixed(1)}</strong>
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: 8 }}>
            {t('aiContextHint')}
          </p>
        </motion.section>
      )}

      {/* Usage / quota */}
      <section className="card">
        <div className="card-header">
          <Bot size={14} />
          <span>{t('aiUsage')}</span>
        </div>
        <div className="ai-usage">
          <div className="ai-usage-bar">
            <div
              className="ai-usage-fill"
              style={{ width: `${Math.min(100, ((usage?.usedQueries ?? 0) / (usage?.limit ?? 20)) * 100)}%` }}
            />
          </div>
          <span className="ai-usage-text">
            {usage?.usedQueries ?? 0} / {usage?.limit ?? 20} {t('remainingQueries')}
          </span>
        </div>
        <p className="text-muted" style={{ fontSize: '0.82rem' }}>
          {isPro
            ? (language === 'es' ? 'Plan Pro: 200 consultas/mes incluidas.' : 'Pro plan: 200 queries/month included.')
            : t('aiQuotaNote')}
        </p>
      </section>
    </div>
  )
}

// ─── Result Display Component ─────────────────────────────────────────────────

function AiResultDisplay({ data, language }: { data: Record<string, unknown>; language: string }) {
  const isEs = language === 'es'

  // Try to extract common fields
  const summary = (data.summary as string) ?? (data.general_advice as string) ?? ''
  const riskLevel = data.risk_level as string | undefined
  const status = data.status as string | undefined
  const recommendations = (data.recommendations as string[]) ?? []
  const signals = (data.signals as string[]) ?? []
  const deviations = (data.deviations as string[]) ?? []
  const adjustments = (data.adjustments as Array<Record<string, string>>) ?? []
  const restNeeded = data.rest_day_needed as boolean | undefined

  return (
    <div className="ai-result-content">
      {/* Summary */}
      {summary && (
        <p className="ai-result-summary">{summary}</p>
      )}

      {/* Status / Risk */}
      {(riskLevel || status) && (
        <div className="ai-result-badges">
          {riskLevel && (
            <span className={`ai-risk-badge ${riskLevel}`}>
              {isEs ? 'Riesgo' : 'Risk'}: {riskLevel}
            </span>
          )}
          {status && (
            <span className={`ai-status-badge ${status}`}>
              {status.replace(/_/g, ' ')}
            </span>
          )}
          {restNeeded && (
            <span className="ai-rest-badge">
              {isEs ? 'Dia de descanso recomendado' : 'Rest day recommended'}
            </span>
          )}
        </div>
      )}

      {/* Deviations */}
      {deviations.length > 0 && (
        <div className="ai-result-list">
          <strong>{isEs ? 'Desviaciones' : 'Deviations'}</strong>
          <ul>
            {deviations.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}

      {/* Signals */}
      {signals.length > 0 && (
        <div className="ai-result-list">
          <strong>{isEs ? 'Senales detectadas' : 'Signals detected'}</strong>
          <ul>
            {signals.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Adjustments */}
      {adjustments.length > 0 && (
        <div className="ai-result-list">
          <strong>{isEs ? 'Ajustes propuestos' : 'Proposed adjustments'}</strong>
          {adjustments.map((adj, i) => (
            <div key={i} className="ai-adjustment-card">
              <span className="text-muted">{adj.session_date}</span>
              <p><strong>{adj.proposed_change}</strong></p>
              <small className="text-muted">{adj.reason}</small>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="ai-result-list">
          <strong>{isEs ? 'Recomendaciones' : 'Recommendations'}</strong>
          <ul>
            {recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
