import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Bike,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Moon,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { useTodaySession } from '../hooks/useTodaySession'
import { useStravaConnection } from '../hooks/useStrava'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import type { ReactNode } from 'react'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

const sportIcon: Record<string, ReactNode> = {
  run: <Footprints size={14} />,
  bike: <Bike size={14} />,
  swim: <Waves size={14} />,
  gym: <Dumbbell size={14} />,
  rest: <Moon size={14} />,
  other: <Activity size={14} />,
}

export function Dashboard() {
  const { t } = useI18n()
  const { profile } = useAuth()
  const { metrics, hasData, loading } = useDashboardMetrics()
  const { data: today, loading: todayLoading } = useTodaySession()
  const { status: stravaStatus } = useStravaConnection()

  const stravaConnected = Boolean(stravaStatus?.connected)
  const maxWeeklyTss = Math.max(...metrics.weeklySeries.map((d) => d.tss), 1)
  const showEmpty = !loading && !hasData

  return (
    <div className="page-dashboard">
      {/* ── Hero AI Coach Card ─────────────────────────────────────────── */}
      <motion.section
        className="hero-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-content">
          <span className="badge">Peak IA Coach</span>
          <h2>
            {profile?.display_name ? `${t('aiHeroPrefix')}, ${profile.display_name.split(' ')[0]}.` : t('aiHeroFallback')}
          </h2>
          <p className="hero-subtitle">{t('aiHeroSubtitle')}</p>
          <div className="hero-actions">
            <Link to="/app/ia-coach" className="btn-primary">{t('analyzeWeek')}</Link>
            <Link to="/app/plan" className="btn-secondary">{t('adjustPlan')}</Link>
            <Link to="/app/analisis" className="btn-secondary">{t('detectFatigue')}</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="pulse-ring" />
          <div className="pulse-ring delay-1" />
          <div className="pulse-core" />
        </div>
      </motion.section>

      {/* ── Connect-Strava nudge ──────────────────────────────────────── */}
      {!stravaConnected && (
        <motion.div
          className="card connect-banner"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="connect-banner-icon" style={{ background: '#fc4c02' }}>S</div>
          <div className="connect-banner-body">
            <strong>{t('connectStravaTitle')}</strong>
            <small>{t('connectStravaHint')}</small>
          </div>
          <Link to="/app/conexiones" className="btn-primary btn-sm">
            {t('connectStrava')}
          </Link>
        </motion.div>
      )}

      {/* ── Metrics Grid ───────────────────────────────────────────────── */}
      <section className="metrics-grid">
        {[
          { icon: <Heart size={18} />, label: t('mForma'), value: metrics.formPct, unit: '%', color: 'green' },
          { icon: <Zap size={18} />, label: t('mCarga'), value: metrics.weeklyTss, unit: 'TSS', color: 'blue' },
          { icon: <TrendingUp size={18} />, label: t('mAptitud'), value: metrics.ctl, unit: 'CTL', color: 'purple' },
          { icon: <Flame size={18} />, label: t('mFatiga'), value: metrics.atl, unit: 'ATL', color: 'orange' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className={`metric-card metric-${m.color}`}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="metric-icon">{m.icon}</div>
            <div className="metric-body">
              <span className="metric-label">{m.label}</span>
              <div className="metric-value">
                <strong>
                  {showEmpty ? '--' : <AnimatedNumber value={m.value} />}
                </strong>
                <small>{m.unit}</small>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Two-column dashboard grid ──────────────────────────────────── */}
      <div className="dashboard-grid">
        {/* Today's session */}
        <motion.section
          className="card"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Activity size={16} />
            <span>{t('trainingOfDay')}</span>
          </div>
          {todayLoading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : today ? (
            <div className="today-session">
              <div className="today-session-icon">{sportIcon[today.sport] ?? sportIcon.other}</div>
              <div className="today-session-body">
                <strong>{today.title}</strong>
                <span className="text-muted">
                  {today.duration_minutes ? `${today.duration_minutes} min` : ''}
                  {today.intensity ? ` · ${today.intensity}` : ''}
                </span>
                {today.notes && <small className="text-muted">{today.notes}</small>}
              </div>
              <span className={`status-badge ${today.status === 'completed' ? 'success' : 'warning'}`}>
                {t(today.status === 'completed' ? 'completed' : 'planned')}
              </span>
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('noData')}</p>
              <small>{stravaConnected ? t('noSessionToday') : t('connectSource')}</small>
            </div>
          )}
        </motion.section>

        {/* Recovery / Quick read */}
        <motion.section
          className="card"
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Moon size={16} />
            <span>{t('quickRead')}</span>
          </div>
          <div className="recovery-grid">
            <div className="recovery-item">
              <span className="recovery-label">TSB</span>
              <span className="recovery-value">{showEmpty ? '--' : <AnimatedNumber value={metrics.tsb} />}</span>
            </div>
            <div className="recovery-item">
              <span className="recovery-label">{t('weeklyHours')}</span>
              <span className="recovery-value">{showEmpty ? '--' : <AnimatedNumber value={metrics.weeklyHours} decimals={1} />}</span>
            </div>
            <div className="recovery-item">
              <span className="recovery-label">{t('weeklyDistance')}</span>
              <span className="recovery-value">{showEmpty ? '--' : <AnimatedNumber value={metrics.weeklyDistance} decimals={1} />}</span>
            </div>
          </div>
        </motion.section>

        {/* Weekly TSS bars */}
        <motion.section
          className="card"
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <TrendingUp size={16} />
            <span>{t('weeklyState')}</span>
          </div>
          <div className="week-bars">
            {metrics.weeklySeries.map((d) => {
              const heightPct = Math.max(8, (d.tss / maxWeeklyTss) * 100)
              return (
                <div key={d.iso} className="week-bar-item" title={`${d.iso}: ${Math.round(d.tss)} TSS`}>
                  <motion.div
                    className="week-bar"
                    initial={{ height: 0 }}
                    animate={{ height: showEmpty ? '20%' : `${heightPct}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: d.tss > 0 ? 'var(--accent)' : 'var(--bg-3)' }}
                  />
                  <span>{d.day}</span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* Recent activities */}
        <motion.section
          className="card"
          custom={7}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Zap size={16} />
            <span>{t('recentActivities')}</span>
          </div>
          {metrics.recent.length === 0 ? (
            <div className="empty-state">
              <p>{t('noData')}</p>
              <small>{stravaConnected ? t('syncToSeeActivities') : t('connectSource')}</small>
            </div>
          ) : (
            <ul className="recent-list">
              {metrics.recent.map((a) => (
                <li key={a.id} className="recent-item">
                  <span className="recent-icon">{sportIcon[a.sport] ?? sportIcon.other}</span>
                  <div className="recent-body">
                    <strong>{a.title}</strong>
                    <small className="text-muted">
                      {a.date}
                      {a.distance_km ? ` · ${a.distance_km.toFixed(1)} km` : ''}
                      {a.duration_minutes ? ` · ${a.duration_minutes} min` : ''}
                      {a.tss ? ` · ${a.tss} TSS` : ''}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  )
}
