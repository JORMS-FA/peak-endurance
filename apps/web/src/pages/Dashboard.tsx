import { useMemo, useState, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Flame,
  Heart,
  Moon,
  TrendingUp,
  Zap,
  Lock,
} from 'lucide-react'
import {
  ResponsiveContainer,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts'
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { useTodaySession } from '../hooks/useTodaySession'
import { useStravaConnection } from '../hooks/useStrava'
import { useHealthSources } from '../hooks/useHealthSources'
import { useHealthMetrics } from '../hooks/useHealthMetrics'
import { useDashboardLayout } from '../hooks/useDashboardLayout'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { SportIcon, SPORT_COLORS } from '../components/ui/SportIcon'
import { LevelCard } from '../components/ui/LevelCard'

import {
  WidgetFrame,
  WIDGET_LABEL_KEYS,
} from '../components/ui/DashboardWidgetGrid'
import type { WidgetKey } from '../lib/types'

// ─── Animation Variants ─────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

// ─── PMC Computation ────────────────────────────────────────────────────────
type PmcPoint = { date: string; ctl: number; atl: number; tsb: number; tss: number }

function computePmcSeries(daily: { date: string; tss: number }[]): PmcPoint[] {
  let ctl = 0
  let atl = 0
  return daily.map((d) => {
    ctl += (d.tss - ctl) / 42
    atl += (d.tss - atl) / 7
    return { date: d.date, ctl: Math.round(ctl), atl: Math.round(atl), tsb: Math.round(ctl - atl), tss: d.tss }
  })
}

// ─── Chart Theme Constants ──────────────────────────────────────────────────
const CHART_GRID_STROKE = 'rgba(255,255,255,0.06)'
const CHART_TEXT_COLOR = '#b8bcc8'
const TOOLTIP_BG = '#1a1a2e'
const TOOLTIP_BORDER = '#2a2a3e'

// ─── Custom Tooltips ────────────────────────────────────────────────────────
interface PmcTooltipPayloadItem {
  name: string
  value: number
  color: string
}

function PmcTooltip({ active, payload, label }: { active?: boolean; payload?: PmcTooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: CHART_TEXT_COLOR }}>
      <p style={{ margin: 0, fontWeight: 600, marginBottom: 4, color: '#fff' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ margin: '2px 0', color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  )
}

interface WeeklyTooltipPayloadItem {
  value: number
}

function WeeklyTooltip({ active, payload, label }: { active?: boolean; payload?: WeeklyTooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: CHART_TEXT_COLOR }}>
      <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{label}</p>
      <p style={{ margin: '4px 0', color: '#06b6d4' }}>TSS: <strong>{Math.round(payload[0].value)}</strong></p>
    </div>
  )
}

// ─── Dashboard Component ────────────────────────────────────────────────────
export function Dashboard() {
  const { t, language } = useI18n()
  const { profile } = useAuth()
  const { metrics, hasData, loading } = useDashboardMetrics()
  const { data: today, loading: todayLoading } = useTodaySession()
  const { status: stravaStatus, loading: stravaLoading } = useStravaConnection()
  const { hasSources } = useHealthSources()
  const { today: healthToday, hasToday } = useHealthMetrics()
  const layout = useDashboardLayout()
  const { customizeMode } = useOutletContext<{ customizeMode: boolean }>()

  const stravaConnected = Boolean(stravaStatus?.connected)
  const showEmpty = !loading && !hasData
  const showOnboarding = showEmpty && !stravaConnected
  const showSyncing = showEmpty && stravaConnected
  const fullName = profile?.display_name ?? 'Atleta'
  const firstName = fullName.split(' ')[0] ?? fullName

  // ═══ Weekly snapshot for the scrollable panel ═══
  const activitiesThisWeek = metrics.weeklySeries.filter((d) => d.tss > 0).length
  const totalActivities = metrics.recent.length
  const streakDays = useMemo(() => {
    if (!metrics.recent.length) return 0
    const dates = [...new Set(metrics.recent.map((a) => a.date))].sort().reverse()
    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) streak++
      else break
    }
    return streak
  }, [metrics.recent])

  // Weekly TSS target (scaled from last month average)
  const weeklyTssTarget = Math.max(Math.round(metrics.ctl * 7), 200)
  const tssProgress = Math.min(Math.round((metrics.weeklyTss / weeklyTssTarget) * 100), 100)

  // Snapshot carousel index
  const [snapshotIdx, setSnapshotIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const onSnapshotScroll = useCallback(() => {
    if (!containerRef.current) return
    const idx = Math.round(containerRef.current.scrollLeft / containerRef.current.clientWidth)
    setSnapshotIdx(idx)
  }, [])

  // Recovery ring state — gated on real health data, never fake numbers.
  const recoveryPct = healthToday?.recovery_pct ?? null
  const recoveryLocked = !hasSources
  const recoverySyncing = hasSources && !hasToday

  // Compute PMC series for chart
  const pmcSeries = useMemo(() => computePmcSeries(metrics.daily), [metrics.daily])

  // Compute sport distribution from recent activities
  const pieData = useMemo(() => {
    const sportCounts = metrics.recent.reduce<Record<string, number>>((acc, a) => {
      const sport = a.sport || 'other'
      acc[sport] = (acc[sport] || 0) + 1
      return acc
    }, {})
    return Object.entries(sportCounts).map(([name, value]) => ({ name, value }))
  }, [metrics.recent])

  // ── Widget content renderers ──────────────────────────────────────────────
  // Each dashboard section is keyed by a WidgetKey so the layout hook can
  // reorder / hide it. Returns null when a widget has nothing to show.
  const widgetContent = (key: WidgetKey): ReactNode => {
    switch (key) {
      case 'coach':
        // Coach is now a floating FAB, not a widget card
        return null

      case 'recovery':
        return (
          <motion.section
            className="glass-card energy-card"
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            {recoveryLocked ? (
              <div className="energy-locked">
                <div className="energy-locked-icon">
                  <Lock size={26} strokeWidth={1.5} />
                </div>
                <div className="energy-locked-body">
                  <h3 className="energy-card-title">{t('recoveryLockedTitle')}</h3>
                  <p className="energy-locked-cta">{t('recoveryLockedCta')}</p>
                  <Link to="/app/conexiones" className="btn-primary btn-sm energy-locked-btn">
                    <span>{t('connectHealth')}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="energy-ring-container">
                <div className="energy-ring-chart">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Energy', value: recoverySyncing ? 0 : (recoveryPct ?? 0) },
                          { name: 'Remaining', value: recoverySyncing ? 100 : 100 - (recoveryPct ?? 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={62}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                      >
                        <Cell fill="var(--accent)" />
                        <Cell fill="rgba(255,255,255,0.06)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="energy-ring-label">
                    {recoverySyncing ? (
                      <>
                        <span className="energy-ring-pct">…</span>
                        <span className="energy-ring-title">{t('recoveryEnergy')}</span>
                      </>
                    ) : (
                      <>
                        <span className="energy-ring-pct">{recoveryPct !== null ? `${Math.round(recoveryPct)}%` : '—'}</span>
                        <span className="energy-ring-title">{t('recoveryEnergy')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="energy-metrics">
                  <h3 className="energy-card-title">{t('recoveryTitle')}</h3>
                  {recoverySyncing ? (
                    <div className="energy-syncing">
                      <div className="spinner" />
                      <small className="text-muted">{t('recoverySyncingToday')}</small>
                    </div>
                  ) : (
                    <div className="energy-metrics-grid">
                      <div className="energy-metric">
                        <Moon size={14} strokeWidth={1.5} />
                        <div className="energy-metric-body">
                          <span className="energy-metric-label">{t('recoverySleep')}</span>
                          <span className="energy-metric-value">
                            {healthToday?.sleep_hours !== null && healthToday?.sleep_hours !== undefined
                              ? `${healthToday.sleep_hours}h`
                              : '—'}
                          </span>
                        </div>
                      </div>
                      <div className="energy-metric">
                        <Heart size={14} strokeWidth={1.5} />
                        <div className="energy-metric-body">
                          <span className="energy-metric-label">{t('recoveryHrv')}</span>
                          <span className="energy-metric-value">
                            {healthToday?.hrv_ms !== null && healthToday?.hrv_ms !== undefined
                              ? `${healthToday.hrv_ms}ms`
                              : '—'}
                          </span>
                        </div>
                      </div>
                      <div className="energy-metric">
                        <Activity size={14} strokeWidth={1.5} />
                        <div className="energy-metric-body">
                          <span className="energy-metric-label">{t('recoveryRecovery')}</span>
                          <span className="energy-metric-value">
                            {recoveryPct !== null ? `${Math.round(recoveryPct)}%` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <small className="text-muted energy-hint">{t('recoveryLiveHint')}</small>
                </div>
              </div>
            )}
          </motion.section>
        )

      case 'connect_banner':
        if (stravaLoading || stravaConnected || showOnboarding) return null
        return (
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
        )

      case 'metrics':
        return (
          <section className="metrics-grid">
            {[
              { icon: <Heart size={18} strokeWidth={1.5} />, label: t('mForma'), value: metrics.formPct, unit: '%', color: 'green' },
              { icon: <Zap size={18} strokeWidth={1.5} />, label: t('mCarga'), value: metrics.weeklyTss, unit: 'TSS', color: 'blue' },
              { icon: <TrendingUp size={18} strokeWidth={1.5} />, label: t('mAptitud'), value: metrics.ctl, unit: 'CTL', color: 'purple' },
              { icon: <Flame size={18} strokeWidth={1.5} />, label: t('mFatiga'), value: metrics.atl, unit: 'ATL', color: 'orange' },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                className={`metric-card metric-${m.color}`}
                custom={i + 3}
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
        )

      case 'level':
        return <LevelCard />

      case 'pmc_chart':
        return (
          <motion.section
            className="card chart-card"
            custom={7}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="card-header">
              <TrendingUp size={16} strokeWidth={1.5} />
              <span>{t('weeklyState')} — PMC (90 días)</span>
            </div>
            {showEmpty ? (
              <div className="empty-state"><p>{t('noData')}</p></div>
            ) : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pmcSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tsbGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
                      tickFormatter={(val: string) => val.slice(5)}
                      interval="preserveStartEnd"
                      axisLine={{ stroke: CHART_GRID_STROKE }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<PmcTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: CHART_TEXT_COLOR }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tsb"
                      name="TSB (Form)"
                      stroke="#22c55e"
                      fill="url(#tsbGradient)"
                      strokeWidth={1.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="ctl"
                      name="CTL (Fitness)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#3b82f6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="atl"
                      name="ATL (Fatigue)"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#f97316' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.section>
        )

      case 'weekly_load':
        return (
          <motion.section
            className="card chart-card"
            custom={8}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="card-header">
              <Zap size={16} strokeWidth={1.5} />
              <span>Carga Semanal (TSS)</span>
            </div>
            {showEmpty ? (
              <div className="empty-state"><p>{t('noData')}</p></div>
            ) : (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.weeklySeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
                      axisLine={{ stroke: CHART_GRID_STROKE }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar
                      dataKey="tss"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.section>
        )

      case 'sport_distribution':
        return (
          <motion.section
            className="card chart-card"
            custom={9}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="card-header">
              <Activity size={16} strokeWidth={1.5} />
              <span>Distribución por Deporte</span>
            </div>
            {pieData.length === 0 ? (
              <div className="empty-state"><p>{t('noData')}</p></div>
            ) : (
              <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={SPORT_COLORS[entry.name] || SPORT_COLORS.other}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: TOOLTIP_BG,
                        border: `1px solid ${TOOLTIP_BORDER}`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: CHART_TEXT_COLOR,
                      }}
                      formatter={(value, name) => [`${value} actividades`, String(name)] as [string, string]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: CHART_TEXT_COLOR }}
                      formatter={(value: string) => <span style={{ color: CHART_TEXT_COLOR }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.section>
        )

      case 'today_session':
        return (
          <motion.section
            className="card"
            custom={10}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="card-header">
              <Activity size={16} strokeWidth={1.5} />
              <span>{t('trainingOfDay')}</span>
            </div>
            {todayLoading ? (
              <div className="empty-state"><div className="spinner" /></div>
            ) : today ? (
              <div className="today-session">
                <div className="today-session-icon"><SportIcon sport={today.sport} size={16} /></div>
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
        )

      case 'quick_read':
        return (
          <motion.section
            className="card"
            custom={11}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="card-header">
              <Moon size={16} strokeWidth={1.5} />
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
        )

      case 'recent_activities':
        return (
          <motion.section
            className="card"
            custom={12}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="card-header">
              <Zap size={16} strokeWidth={1.5} />
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
                    <span className="recent-icon"><SportIcon sport={a.sport} size={14} /></span>
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
        )

      default:
        return null
    }
  }

  const renderWidget = (
    w: { widget_key: WidgetKey; visible: boolean },
    idx: number,
    total: number,
  ) => {
    const content = widgetContent(w.widget_key)
    if (content === null || content === false) return null
    return (
      <WidgetFrame
        key={w.widget_key}
        widgetKey={w.widget_key}
        label={t(WIDGET_LABEL_KEYS[w.widget_key])}
        customizeMode={customizeMode}
        visible={w.visible}
        canUp={idx > 0}
        canDown={idx < total - 1}
        onUp={() => layout.moveUp(w.widget_key)}
        onDown={() => layout.moveDown(w.widget_key)}
        onToggle={() => layout.toggleVisible(w.widget_key)}
        t={t}
      >
        {content}
      </WidgetFrame>
    )
  }

  const visibleWidgets = layout.widgets.filter((w) => customizeMode || w.visible)

  // Push "unavailable" widgets (health-source locked) to the bottom
  const unavailableKeys = new Set<WidgetKey>(
    recoveryLocked ? ['recovery'] : []
  )
  const sortedWidgets = [
    ...visibleWidgets.filter((w) => !unavailableKeys.has(w.widget_key)),
    ...visibleWidgets.filter((w) => unavailableKeys.has(w.widget_key)),
  ]

  return (
    <>
      <div className="page-dashboard">
      {/* Removed CustomizeToggle — keeping first screen clean per user request */}

      {showOnboarding ? (
        <div className="dashboard-widgets">
          {renderWidget({ widget_key: 'coach', visible: true }, 0, 2)}
          {renderWidget({ widget_key: 'recovery', visible: true }, 1, 2)}
          <motion.section
            className="glass-card onboarding-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="onboarding-illustration">
              <Zap size={48} strokeWidth={1.5} />
            </div>
            <h2 className="onboarding-title">{t('onboardingTitle')}</h2>
            <p className="onboarding-subtitle">{t('onboardingSubtitle')}</p>
            <Link to="/app/conexiones" className="btn-primary onboarding-cta">
              <span className="strava-mark">S</span>
              {t('connectStrava')}
            </Link>
            <div className="onboarding-meta">
              <span className="onboarding-meta-item"><TrendingUp size={14} strokeWidth={1.5} /> CTL · ATL · TSB</span>
              <span className="onboarding-meta-item"><Activity size={14} strokeWidth={1.5} /> {language === 'es' ? 'Carga semanal' : 'Weekly load'}</span>
              <span className="onboarding-meta-item"><Flame size={14} strokeWidth={1.5} /> {language === 'es' ? 'Distribución por deporte' : 'Sport distribution'}</span>
            </div>
          </motion.section>
        </div>
      ) : showSyncing ? (
        <div className="dashboard-widgets">
          {renderWidget({ widget_key: 'coach', visible: true }, 0, 2)}
          {renderWidget({ widget_key: 'recovery', visible: true }, 1, 2)}
          <motion.section
            className="glass-card onboarding-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="onboarding-illustration is-syncing">
              <div className="spinner" />
            </div>
            <h2 className="onboarding-title">{t('syncingTitle')}</h2>
            <p className="onboarding-subtitle">{t('syncingSubtitle')}</p>
          </motion.section>
        </div>
      ) : (
        <div className="dashboard-widgets">
          {/* Greeting + Quick Stats Strip */}
          <motion.div
            className="dashboard-greeting-row"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="dashboard-greeting-left">
              <h2 className="dashboard-greeting-text">
                {language === 'es' ? (new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches') : 'Good morning'}, {firstName}
              </h2>
              <span className="dashboard-greeting-sub">
                {showEmpty ? '' : `Última actividad: ${metrics.recent[0]?.sport === 'run' ? 'corriendo' : metrics.recent[0]?.sport === 'bike' ? 'bicicleta' : metrics.recent[0]?.sport} · ${(metrics.recent[0]?.distance_km ?? 0).toFixed(1)}km`}
              </span>
            </div>
          </motion.div>
          {/* Scrollable snapshot panels — full-width carousel */}
          <div className="snapshot-section">
            <motion.div
              ref={containerRef}
              className="snapshot-carousel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              onScroll={onSnapshotScroll}
            >
              {/* ── Weekly Summary ── */}
              <div className="snapshot-slide">
                <div className="snapshot-card">
                  <div className="snapshot-card-header">
                    <Activity size={14} strokeWidth={1.5} />
                    <span className="snapshot-card-title">{language === 'es' ? 'Resumen semanal' : 'Weekly summary'}</span>
                  </div>
                  <div className="snapshot-metrics">
                    <div className="snapshot-metric">
                      <span className="snapshot-metric-value">{activitiesThisWeek}</span>
                      <span className="snapshot-metric-label">{language === 'es' ? 'Actividades' : 'Activities'}</span>
                    </div>
                    <div className="snapshot-metric">
                      <span className="snapshot-metric-value">{metrics.weeklyHours.toFixed(1)}<small>h</small></span>
                      <span className="snapshot-metric-label">{language === 'es' ? 'Duración' : 'Duration'}</span>
                    </div>
                    <div className="snapshot-metric">
                      <span className="snapshot-metric-value">{metrics.weeklyDistance.toFixed(1)}<small>km</small></span>
                      <span className="snapshot-metric-label">{language === 'es' ? 'Distancia' : 'Distance'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Goals / Metas ── */}
              <div className="snapshot-slide">
                <div className="snapshot-card">
                  <div className="snapshot-card-header">
                    <Zap size={14} strokeWidth={1.5} />
                    <span className="snapshot-card-title">{language === 'es' ? 'Metas' : 'Goals'}</span>
                  </div>
                  <div className="snapshot-goals">
                    <div className="snapshot-goal">
                      <div className="snapshot-goal-row">
                        <span className="snapshot-goal-label">TSS</span>
                        <span className="snapshot-goal-numbers">{Math.round(metrics.weeklyTss).toLocaleString()} / {weeklyTssTarget.toLocaleString()}</span>
                      </div>
                      <div className="snapshot-goal-bar">
                        <div className="snapshot-goal-fill" style={{ width: `${tssProgress}%` }} />
                      </div>
                    </div>
                    <div className="snapshot-goal">
                      <div className="snapshot-goal-row">
                        <span className="snapshot-goal-label">{language === 'es' ? 'Distancia' : 'Distance'}</span>
                        <span className="snapshot-goal-numbers">{metrics.weeklyDistance.toFixed(0)} / 80<small>km</small></span>
                      </div>
                      <div className="snapshot-goal-bar">
                        <div className="snapshot-goal-fill is-purple" style={{ width: `${Math.min(Math.round((metrics.weeklyDistance / 80) * 100), 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Streak / Racha ── */}
              <div className="snapshot-slide">
                <div className="snapshot-card is-streak">
                  <div className="snapshot-streak-icon">🔥</div>
                  <div className="snapshot-streak-body">
                    <span className="snapshot-streak-count">{streakDays}</span>
                    <span className="snapshot-streak-label">{language === 'es' ? 'días seguidos' : 'day streak'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dot indicators */}
            <div className="snapshot-dots">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`snapshot-dot${i === snapshotIdx ? ' is-active' : ''}`}
                  aria-label={`${language === 'es' ? 'Ir al panel' : 'Go to panel'} ${i + 1}`}
                  onClick={() => {
                    if (containerRef.current) {
                      containerRef.current.scrollTo({ left: i * containerRef.current.clientWidth, behavior: 'smooth' })
                      setSnapshotIdx(i)
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {sortedWidgets.map((w, idx) => renderWidget(w, idx, sortedWidgets.length))}
        </div>
      )}
      </div>
    </>
  )
}
