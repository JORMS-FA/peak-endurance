import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, Lock, Shield, Sparkles, Zap } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useStravaConnection } from '../hooks/useStrava'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'

type ActionKey = 'analyzeWeek' | 'adjustPlan' | 'detectFatigue'

export function AiCoach() {
  const { t } = useI18n()
  const { status: strava } = useStravaConnection()
  const { metrics, hasData } = useDashboardMetrics()
  const [pickedAction, setPickedAction] = useState<ActionKey | null>(null)

  const stravaConnected = Boolean(strava?.connected)
  const blockedReason = !stravaConnected
    ? 'aiBlockedNoStrava'
    : !hasData
      ? 'aiBlockedNoActivities'
      : null

  const actions: { key: ActionKey; icon: ReactNode; descKey: string }[] = [
    { key: 'analyzeWeek', icon: <Sparkles size={20} />, descKey: 'aiAnalyzeDesc' },
    { key: 'adjustPlan', icon: <Zap size={20} />, descKey: 'aiAdjustDesc' },
    { key: 'detectFatigue', icon: <Shield size={20} />, descKey: 'aiFatigueDesc' },
  ]

  return (
    <div className="page-ai">
      <div className="page-header">
        <h2>{t('aiCoach')}</h2>
        <span className="badge">Beta</span>
      </div>

      {/* Hero */}
      <motion.section
        className="ai-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="ai-hero-icon">
          <Bot size={28} />
        </div>
        <h3>{t('aiHeroH')}</h3>
        <p>{t('aiHeroP')}</p>
      </motion.section>

      {/* Blocked banner — when no data, the AI literally can't do anything useful */}
      {blockedReason && (
        <motion.div
          className="card ai-blocked"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Lock size={16} />
          <div className="ai-blocked-body">
            <strong>{t('aiBlockedTitle')}</strong>
            <small>{t(blockedReason as 'aiBlockedNoStrava')}</small>
          </div>
          <Link to="/app/conexiones" className="btn-primary btn-sm">
            {t('connectStrava')}
          </Link>
        </motion.div>
      )}

      {/* Action cards */}
      <div className="ai-actions-grid">
        {actions.map((a, i) => {
          const disabled = blockedReason !== null
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
              {disabled && <span className="ai-locked-badge"><Lock size={10} /> {t('locked')}</span>}
            </motion.button>
          )
        })}
      </div>

      {/* Selected-action prompt — explains what the action will do once AI worker is live */}
      {pickedAction && (
        <motion.section
          className="card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-header">
            <Sparkles size={14} />
            <span>{t(pickedAction)}</span>
          </div>
          <p style={{ fontSize: '0.92rem', marginBottom: 8 }}>
            {t(`${pickedAction}Long` as 'analyzeWeekLong')}
          </p>
          <p className="text-muted" style={{ fontSize: '0.82rem' }}>
            {t('aiSoonHint')}
          </p>
        </motion.section>
      )}

      {/* Live context — shown when there IS data so the user sees the inputs the AI will use */}
      {hasData && (
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
            <div className="ai-usage-fill" style={{ width: '0%' }} />
          </div>
          <span className="ai-usage-text">0 / 20 {t('remainingQueries')}</span>
        </div>
        <p className="text-muted" style={{ fontSize: '0.82rem' }}>
          {t('aiQuotaNote')}
        </p>
      </section>
    </div>
  )
}
