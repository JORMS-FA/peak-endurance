import { Mountain } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

export function Segments() {
  const { t } = useI18n()

  return (
    <div className="page-segments">
      <div className="page-header">
        <h2>{t('segments')}</h2>
      </div>

      <div className="segments-filters">
        <button type="button" className="chip active">Todos</button>
        <button type="button" className="chip">Running</button>
        <button type="button" className="chip">Ciclismo</button>
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">
            <Mountain size={24} />
          </div>
          <h3>{t('noData')}</h3>
          <p>Conecta Strava para explorar segmentos populares cerca de ti.</p>
        </div>
      </div>
    </div>
  )
}
