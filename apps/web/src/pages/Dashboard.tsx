import { Activity, Flame, Heart, Moon, TrendingUp, Zap } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

export function Dashboard() {
  const { t } = useI18n()

  return (
    <div className="page-dashboard">
      {/* Hero AI Coach Card */}
      <section className="hero-card">
        <div className="hero-content">
          <span className="badge">Peak IA Coach</span>
          <h2>Tu entrenador inteligente</h2>
          <p className="hero-subtitle">Planifica. Ajusta. Optimiza.</p>
          <div className="hero-actions">
            <button type="button" className="btn-primary">{t('analyzeWeek')}</button>
            <button type="button" className="btn-secondary">{t('adjustPlan')}</button>
            <button type="button" className="btn-secondary">{t('detectFatigue')}</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="pulse-ring" />
          <div className="pulse-ring delay-1" />
          <div className="pulse-core" />
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="metrics-grid">
        <MetricCard icon={<Heart size={18} />} label="Forma" value="--" unit="%" color="green" />
        <MetricCard icon={<Zap size={18} />} label="Carga" value="--" unit="TSS" color="blue" />
        <MetricCard icon={<TrendingUp size={18} />} label="Aptitud" value="--" unit="CTL" color="purple" />
        <MetricCard icon={<Flame size={18} />} label="Fatiga" value="--" unit="ATL" color="orange" />
      </section>

      {/* Two column layout */}
      <div className="dashboard-grid">
        {/* Today's workout */}
        <section className="card">
          <div className="card-header">
            <Activity size={16} />
            <span>{t('trainingOfDay')}</span>
          </div>
          <div className="empty-state">
            <p>{t('noData')}</p>
            <small>{t('connectSource')}</small>
          </div>
        </section>

        {/* Recovery */}
        <section className="card">
          <div className="card-header">
            <Moon size={16} />
            <span>{t('quickRead')}</span>
          </div>
          <div className="recovery-grid">
            <div className="recovery-item">
              <span className="recovery-label">HRV</span>
              <span className="recovery-value">--</span>
            </div>
            <div className="recovery-item">
              <span className="recovery-label">FC Rep.</span>
              <span className="recovery-value">--</span>
            </div>
            <div className="recovery-item">
              <span className="recovery-label">Sueno</span>
              <span className="recovery-value">--</span>
            </div>
          </div>
        </section>

        {/* Weekly State */}
        <section className="card">
          <div className="card-header">
            <TrendingUp size={16} />
            <span>{t('weeklyState')}</span>
          </div>
          <div className="week-bars">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
              <div key={day} className="week-bar-item">
                <div className="week-bar" />
                <span>{day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming */}
        <section className="card card-accent">
          <div className="card-header">
            <Zap size={16} />
            <span>{t('upcomingRace')}</span>
          </div>
          <div className="empty-state">
            <p>{t('noData')}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, unit, color }: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  color: string
}) {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-body">
        <span className="metric-label">{label}</span>
        <div className="metric-value">
          <strong>{value}</strong>
          <small>{unit}</small>
        </div>
      </div>
    </div>
  )
}
