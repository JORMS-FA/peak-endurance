import { TrendingUp } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

export function Progress() {
  const { t } = useI18n()

  return (
    <div className="page-progress">
      <div className="page-header">
        <h2>{t('progress')}</h2>
      </div>

      <div className="progress-cards">
        <div className="card">
          <div className="card-header">
            <TrendingUp size={16} />
            <span>Forma (CTL)</span>
          </div>
          <div className="progress-chart-placeholder">
            <svg viewBox="0 0 200 60" className="sparkline-placeholder">
              <path
                d="M0,50 Q50,40 100,30 T200,20"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <TrendingUp size={16} />
            <span>Fatiga (ATL)</span>
          </div>
          <div className="progress-chart-placeholder">
            <svg viewBox="0 0 200 60" className="sparkline-placeholder">
              <path
                d="M0,30 Q50,45 100,35 T200,40"
                fill="none"
                stroke="var(--warning)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <TrendingUp size={16} />
            <span>Balance (TSB)</span>
          </div>
          <div className="progress-chart-placeholder">
            <svg viewBox="0 0 200 60" className="sparkline-placeholder">
              <path
                d="M0,40 Q50,20 100,35 T200,25"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="empty-state">
          <p>{t('connectSource')}</p>
        </div>
      </div>
    </div>
  )
}
