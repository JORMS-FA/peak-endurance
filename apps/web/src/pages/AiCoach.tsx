import { Bot, Sparkles, Zap, Shield } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'

export function AiCoach() {
  const { t } = useI18n()

  return (
    <div className="page-ai">
      <div className="page-header">
        <h2>{t('aiCoach')}</h2>
        <div className="badge">Beta</div>
      </div>

      {/* AI Hero */}
      <section className="ai-hero">
        <div className="ai-hero-icon">
          <Bot size={32} />
        </div>
        <h3>Tu coach personal con IA</h3>
        <p>Analiza tu entrenamiento, detecta patrones y sugiere ajustes inteligentes.</p>
      </section>

      {/* Action Cards */}
      <div className="ai-actions-grid">
        <button type="button" className="ai-action-card">
          <Sparkles size={20} />
          <strong>{t('analyzeWeek')}</strong>
          <small>Revisa el estado de la semana actual</small>
        </button>
        <button type="button" className="ai-action-card">
          <Zap size={20} />
          <strong>{t('adjustPlan')}</strong>
          <small>Optimiza el plan segun tus datos</small>
        </button>
        <button type="button" className="ai-action-card">
          <Shield size={20} />
          <strong>{t('detectFatigue')}</strong>
          <small>Evalua si necesitas descanso</small>
        </button>
      </div>

      {/* Usage */}
      <section className="card">
        <div className="card-header">
          <Bot size={16} />
          <span>Uso de IA</span>
        </div>
        <div className="ai-usage">
          <div className="ai-usage-bar">
            <div className="ai-usage-fill" style={{ width: '0%' }} />
          </div>
          <span className="ai-usage-text">0 / 20 {t('remainingQueries')}</span>
        </div>
        <p className="text-muted">
          Conecta una fuente de datos para que la IA pueda analizar tu entrenamiento real.
        </p>
      </section>
    </div>
  )
}
