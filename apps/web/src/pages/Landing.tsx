import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Cpu,
  Globe,
  LineChart,
  Lock,
  Play,
  Shield,
  Zap,
} from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { APP_NAME } from '@/lib/constants'

export function Landing() {
  const { language } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="landing-page-vercel">
      {/* Header / Navbar */}
      <header className="v-header">
        <div className="v-container">
          <div className="v-header-inner">
            <Link to="/" className="v-brand">
              <div className="v-brand-icon">P</div>
              <span>PEAK ENDURANCE</span>
            </Link>

            <nav className="v-nav">
              <a href="#features">{language === 'es' ? 'Características' : 'Features'}</a>
              <a href="#integrations">{language === 'es' ? 'Integraciones' : 'Integrations'}</a>
              <a href="#how">{language === 'es' ? 'Metodología' : 'Methodology'}</a>
              <a href="#pricing">{language === 'es' ? 'Precios' : 'Pricing'}</a>
            </nav>

            <div className="v-header-actions">
              <button type="button" className="v-btn v-btn-secondary" onClick={() => navigate('/login')}>
                {language === 'es' ? 'Iniciar sesión' : 'Sign in'}
              </button>
              <button type="button" className="v-btn v-btn-primary" onClick={() => navigate('/login')}>
                {language === 'es' ? 'Comenzar gratis' : 'Get started'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="v-hero">
        <div className="v-container">
          <div className="v-badge">
            <span className="v-badge-dot" />
            <span>{language === 'es' ? 'SISTEMA DE ENTRENAMIENTO IA 2.0' : 'AI TRAINING SYSTEM 2.0'}</span>
          </div>

          <h1 className="v-hero-title">
            {language === 'es' ? (
              <>
                Entrena con precisión.<br />Sin adivinanzas.
              </>
            ) : (
              <>
                Train with precision.<br />Zero guesswork.
              </>
            )}
          </h1>

          <p className="v-hero-subtitle">
            {language === 'es'
              ? 'El motor de inteligencia artificial que unifica tu rendimiento en Strava, Garmin y wearables en un único panel analítico de alta precisión.'
              : 'The artificial intelligence engine unifying your performance across Strava, Garmin, and wearables into one precision analytics system.'}
          </p>

          <div className="v-hero-cta">
            <button type="button" className="v-btn v-btn-primary v-btn-large" onClick={() => navigate('/login')}>
              {language === 'es' ? 'Comenzar prueba gratuita' : 'Start 14-day trial'}
              <ArrowRight size={16} />
            </button>
            <button type="button" className="v-btn v-btn-secondary v-btn-large" onClick={() => navigate('/login')}>
              <Play size={15} />
              {language === 'es' ? 'Ver demostración' : 'Watch demo'}
            </button>
          </div>

          {/* Interactive Mockup Dashboard */}
          <div className="v-mockup-wrapper">
            <div className="v-mockup-header">
              <div className="v-mockup-dot" />
              <div className="v-mockup-dot" />
              <div className="v-mockup-dot" />
              <span className="v-mockup-title">peak-engine // v2.4.0-prod</span>
            </div>

            <div className="v-mockup-body">
              <div className="v-metric-card">
                <div className="v-metric-label">
                  <span>CTL // Fitness</span>
                  <Activity size={14} />
                </div>
                <div className="v-metric-value">84</div>
                <div className="v-metric-sub">+5.2 % este mes</div>
              </div>

              <div className="v-metric-card">
                <div className="v-metric-label">
                  <span>ATL // Fatigue</span>
                  <Zap size={14} />
                </div>
                <div className="v-metric-value">52</div>
                <div className="v-metric-sub">Nivel óptimo</div>
              </div>

              <div className="v-metric-card">
                <div className="v-metric-label">
                  <span>TSB // Form</span>
                  <LineChart size={14} />
                </div>
                <div className="v-metric-value" style={{ color: '#ffffff' }}>+16</div>
                <div className="v-metric-sub">Listo para carrera</div>
              </div>

              <div className="v-metric-card">
                <div className="v-metric-label">
                  <span>IA Recovery Score</span>
                  <Cpu size={14} />
                </div>
                <div className="v-metric-value">94%</div>
                <div className="v-metric-sub">Adaptación óptima</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="v-section">
        <div className="v-container">
          <p className="v-section-title">
            {language === 'es' ? 'CONEXIÓN ECOSISTÉMICA DIRECTA' : 'DIRECT ECOSYSTEM CONNECTIONS'}
          </p>

          <div className="v-logos-grid">
            <div className="v-logo-item"><Activity size={18} /> STRAVA</div>
            <div className="v-logo-item"><Globe size={18} /> GARMIN CONNECT</div>
            <div className="v-logo-item"><Zap size={18} /> TRAININGPEAKS</div>
            <div className="v-logo-item"><Shield size={18} /> APPLE HEALTH</div>
            <div className="v-logo-item"><Cpu size={18} /> COROS</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="v-section" style={{ background: '#050505' }}>
        <div className="v-container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="v-hero-title" style={{ fontSize: '2.5rem', marginBottom: 16 }}>
              {language === 'es' ? 'Arquitectura de Alto Rendimiento' : 'High-Performance Architecture'}
            </h2>
            <p className="v-hero-subtitle" style={{ fontSize: '1rem' }}>
              {language === 'es' ? 'Diseñado para atletas de resistencia y entrenadores exigentes.' : 'Designed for endurance athletes and demanding coaches.'}
            </p>
          </div>

          <div className="v-bento-grid">
            <div className="v-bento-card v-bento-col-8">
              <div className="v-card-icon"><Brain size={20} /></div>
              <h3 className="v-card-title">{language === 'es' ? 'Motor Adaptativo por IA' : 'AI Adaptive Engine'}</h3>
              <p className="v-card-text">
                {language === 'es'
                  ? 'Ajusta tu plan de entrenamiento en tiempo real basándose en la variabilidad del ritmo cardíaco (HRV), sueño, estrés y carga semanal real.'
                  : 'Adjusts your training plan in real-time based on HRV, sleep, stress, and actual weekly training load.'}
              </p>
            </div>

            <div className="v-bento-card v-bento-col-4">
              <div className="v-card-icon"><Zap size={20} /></div>
              <h3 className="v-card-title">{language === 'es' ? 'Multi-Deporte' : 'Multi-Sport'}</h3>
              <p className="v-card-text">
                {language === 'es' ? 'Soporte completo para Ciclismo, Running, Natación y Triatlón.' : 'Full support for Cycling, Running, Swimming, and Triathlon.'}
              </p>
            </div>

            <div className="v-bento-card v-bento-col-4">
              <div className="v-card-icon"><LineChart size={20} /></div>
              <h3 className="v-card-title">{language === 'es' ? 'Métricas PMC' : 'PMC Metrics'}</h3>
              <p className="v-card-text">
                {language === 'es' ? 'Modelado preciso de CTL, ATL y TSB sin complicadas hojas de cálculo.' : 'Precise modeling of CTL, ATL, and TSB without complex spreadsheets.'}
              </p>
            </div>

            <div className="v-bento-card v-bento-col-8">
              <div className="v-card-icon"><Lock size={20} /></div>
              <h3 className="v-card-title">{language === 'es' ? 'Privacidad y Seguridad' : 'Privacy & Security'}</h3>
              <p className="v-card-text">
                {language === 'es'
                  ? 'Tus datos biométricos y de ubicación están cifrados bajo los estándares más estrictos. Tu rendimiento te pertenece.'
                  : 'Your biometric and location data are encrypted under strict security standards. Your data belongs to you.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="v-section">
        <div className="v-container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="v-hero-title" style={{ fontSize: '2.5rem', marginBottom: 16 }}>
              {language === 'es' ? 'Precios Transparentes' : 'Transparent Pricing'}
            </h2>
            <p className="v-hero-subtitle" style={{ fontSize: '1rem' }}>
              {language === 'es' ? 'Comienza gratis. Sin permanencia ni sorpresas.' : 'Start free. No commitments or surprises.'}
            </p>
          </div>

          <div className="v-pricing-grid">
            {/* Free */}
            <div className="v-pricing-card">
              <div className="v-pricing-tier">Starter</div>
              <div className="v-pricing-price">$0</div>
              <div className="v-pricing-period">{language === 'es' ? 'Para siempre' : 'Forever free'}</div>

              <ul className="v-pricing-features">
                <li><Check size={16} className="v-check-icon" /> Sincronización Strava</li>
                <li><Check size={16} className="v-check-icon" /> Dashboard básico</li>
                <li><Check size={16} className="v-check-icon" /> 5 análisis IA por mes</li>
              </ul>

              <button type="button" className="v-btn v-btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                {language === 'es' ? 'Empezar gratis' : 'Start free'}
              </button>
            </div>

            {/* Pro Featured */}
            <div className="v-pricing-card featured">
              <div className="v-pricing-badge">RECOMENDADO</div>
              <div className="v-pricing-tier">Pro Member</div>
              <div className="v-pricing-price">$19 <span style={{ fontSize: '1rem', fontWeight: 400 }}>/ mes</span></div>
              <div className="v-pricing-period">{language === 'es' ? 'Facturado mensualmente' : 'Billed monthly'}</div>

              <ul className="v-pricing-features">
                <li><Check size={16} className="v-check-icon" /> Coach IA Ilimitado</li>
                <li><Check size={16} className="v-check-icon" /> Planes de entrenamiento adaptativos</li>
                <li><Check size={16} className="v-check-icon" /> Análisis avanzado PMC (CTL/ATL/TSB)</li>
                <li><Check size={16} className="v-check-icon" /> Conexión multi-wearable</li>
              </ul>

              <button type="button" className="v-btn v-btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                {language === 'es' ? 'Iniciar prueba de 14 días' : 'Start 14-day trial'}
              </button>
            </div>

            {/* Teams */}
            <div className="v-pricing-card">
              <div className="v-pricing-tier">Teams / Coach</div>
              <div className="v-pricing-price">Custom</div>
              <div className="v-pricing-period">{language === 'es' ? 'Para clubes y entrenadores' : 'For clubs & coaches'}</div>

              <ul className="v-pricing-features">
                <li><Check size={16} className="v-check-icon" /> Gestión multi-atleta</li>
                <li><Check size={16} className="v-check-icon" /> Panel centralizado de control</li>
                <li><Check size={16} className="v-check-icon" /> Soporte dedicado 24/7</li>
              </ul>

              <a href="mailto:hola@peakendurance.app" className="v-btn v-btn-secondary" style={{ width: '100%' }}>
                {language === 'es' ? 'Contactar ventas' : 'Contact sales'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="v-footer">
        <div className="v-container">
          <div className="v-footer-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="v-brand-icon" style={{ width: 22, height: 22, fontSize: '0.75rem' }}>P</div>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>PEAK ENDURANCE</span>
            </div>
            <div>&copy; 2026 {APP_NAME}. All rights reserved.</div>
            <div>
              <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none', marginRight: 16 }}>{language === 'es' ? 'Privacidad' : 'Privacy'}</a>
              <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>{language === 'es' ? 'Términos' : 'Terms'}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}