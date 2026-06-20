import { Dumbbell, Plus } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

export function Training() {
  const { t } = useI18n()

  return (
    <div className="page-training">
      <div className="page-header">
        <h2>{t('training')}</h2>
        <button type="button" className="btn-primary btn-sm">
          <Plus size={16} />
          <span>Nuevo</span>
        </button>
      </div>

      <div className="training-filters">
        <button type="button" className="chip active">{t('allSessions')}</button>
        <button type="button" className="chip">{t('planned')}</button>
        <button type="button" className="chip">{t('completed')}</button>
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">
            <Dumbbell size={24} />
          </div>
          <p>{t('noData')}</p>
          <small>{t('connectSource')}</small>
        </div>
      </div>
    </div>
  )
}
