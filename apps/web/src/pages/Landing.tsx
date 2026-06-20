import { useNavigate } from 'react-router-dom'
import { Mountain, Zap, Brain, LineChart, Trophy, Clock, Shield } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { APP_NAME } from '../lib/constants'

export function Landing() {
  const { t } = useI18n()
  const { status } = useAuth()
  const navigate = useNavigate()

  // If already authenticated, redirect to app
  if (status === 'authenticated') {
    navigate('/app', { replace: true })
    return null
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <Mountain size={22} />
          <span>{APP_NAME}</span>
        </div>
        <nav className="landing-nav">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => navigate('/login')}
          >
            {t('signIn')}
          </button>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => navigate('/login')}
          >
            {t('signUp')}
          </button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1>{t('heroTitle')}</h1>
          <p>{t('heroSubtitle')}</p>
          <div className="landing-hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              {t('getStarted')}
            </button>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h2 className="reveal">{t('featuresTitle')}</h2>
        <div className="landing-features-grid stagger-children">
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <Brain size={22} />
            </div>
            <h3>{t('featureAiCoach')}</h3>
            <p>{t('featureAiCoachDesc')}</p>
          </div>
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <LineChart size={22} />
            </div>
            <h3>{t('featureAnalysis')}</h3>
            <p>{t('featureAnalysisDesc')}</p>
          </div>
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <Zap size={22} />
            </div>
            <h3>{t('featureTraining')}</h3>
            <p>{t('featureTrainingDesc')}</p>
          </div>
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <Trophy size={22} />
            </div>
            <h3>{t('featureProgress')}</h3>
            <p>{t('featureProgressDesc')}</p>
          </div>
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <Clock size={22} />
            </div>
            <h3>{t('featureCalendar')}</h3>
            <p>{t('featureCalendarDesc')}</p>
          </div>
          <div className="landing-feature-card reveal">
            <div className="landing-feature-icon">
              <Shield size={22} />
            </div>
            <h3>{t('featureConnections')}</h3>
            <p>{t('featureConnectionsDesc')}</p>
          </div>
        </div>
      </section>

      <section className="landing-pricing">
        <h2 className="reveal">{t('pricingTitle')}</h2>
        <div className="landing-pricing-card reveal-scale">
          <div className="landing-pricing-amount">
            <span className="landing-price">$10</span>
            <span className="landing-price-period">USD / {t('pricingMonth')}</span>
          </div>
          <ul className="landing-pricing-features">
            <li>{t('pricingFeature1')}</li>
            <li>{t('pricingFeature2')}</li>
            <li>{t('pricingFeature3')}</li>
            <li>{t('pricingFeature4')}</li>
          </ul>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/login')}
          >
            {t('getStarted')}
          </button>
        </div>
      </section>

      <footer className="landing-footer reveal-fade">
        <p>&copy; 2025 {APP_NAME}. {t('allRightsReserved')}</p>
      </footer>
    </div>
  )
}
