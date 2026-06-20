import { Flag, Plus } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

export function Plan() {
  const { t } = useI18n()

  return (
    <div className="page-plan">
      <div className="page-header">
        <h2>{t('plan')}</h2>
        <button type="button" className="btn-primary btn-sm">
          <Plus size={16} />
          <span>Crear plan</span>
        </button>
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">
            <Flag size={24} />
          </div>
          <h3>Sin plan activo</h3>
          <p>Crea un plan de entrenamiento o deja que la IA genere uno basado en tu objetivo.</p>
          <button type="button" className="btn-secondary">
            Generar con IA
          </button>
        </div>
      </div>
    </div>
  )
}
