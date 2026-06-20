import { LineChart } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

export function Analysis() {
  const { t } = useI18n()

  return (
    <div className="page-analysis">
      <div className="page-header">
        <h2>{t('analysis')}</h2>
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">
            <LineChart size={24} />
          </div>
          <h3>{t('noData')}</h3>
          <p>{t('connectSource')}</p>
        </div>
      </div>
    </div>
  )
}
