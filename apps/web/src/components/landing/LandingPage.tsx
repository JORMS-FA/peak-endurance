import { useState } from 'react'
import { Brain, Mountain, Shield, TrendingUp } from 'lucide-react'
import { ModalLogin } from '../auth/ModalLogin'

export function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <div className="landing-shell">
        <header className="landing-header">
          <div className="landing-brand">
            <Mountain size={24} />
            <span>Peak Endurance</span>
          </div>
          <button className="landing-login-btn" onClick={() => setShowLogin(true)}>
            Iniciar sesión
          </button>
        </header>

        <section className="landing-hero">
          <div className="landing-hero-content">
            <h1>Tu entrenador inteligente de resistencia</h1>
            <p>
              Planifica, ajusta y optimiza tu rendimiento con análisis basado en IA.
              Peak Endurance convierte datos en decisiones.
            </p>
            <button className="primary-button" onClick={() => setShowLogin(true)}>
              Comenzar gratis
            </button>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-hero-graphic" />
          </div>
        </section>

        <section className="landing-features">
          <h2>Todo lo que necesitas para llegar a tu pico</h2>
          <div className="landing-features-grid">
            <article className="feature-card">
              <Brain size={24} />
              <h3>IA Coach</h3>
              <p>Análisis semanal, detección de fatiga y ajustes automáticos de plan.</p>
            </article>
            <article className="feature-card">
              <TrendingUp size={24} />
              <h3>Métricas avanzadas</h3>
              <p>CTL, ATL, TSB, carga semanal y zonas de frecuencia cardíaca.</p>
            </article>
            <article className="feature-card">
              <Mountain size={24} />
              <h3>Segmentos Strava</h3>
              <p>Explora y sigue segmentos, compara esfuerzos y marca favoritos.</p>
            </article>
            <article className="feature-card">
              <Shield size={24} />
              <h3>Hermes Agent</h3>
              <p>Agente autónomo que supervisa tu entrenamiento y genera reportes semanales.</p>
            </article>
          </div>
        </section>

        <footer className="landing-footer">
          <p>
            &copy; {new Date().getFullYear()} Jorman Fagua &middot;
            <a href="https://github.com/JORMS-FA" target="_blank" rel="noopener noreferrer">
              github.com/JORMS-FA
            </a>
          </p>
        </footer>
      </div>

      {showLogin && <ModalLogin onClose={() => setShowLogin(false)} />}
    </>
  )
}
