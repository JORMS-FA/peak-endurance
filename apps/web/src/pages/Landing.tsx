import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Bike,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Crown,
  Download,
  Footprints,
  LineChart,
  Mountain,
  Play,
  Sparkles,
  TrendingUp,
  Trophy,
  Waves,
  Zap,
} from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { APP_NAME } from '../lib/constants'
import { LavaBackground } from '../components/ui/LavaBackground'
import { Logo } from '../components/ui/Logo'
import { StoreBadges } from '../components/ui/StoreBadges'

export function Landing() {
  const { t, language } = useI18n()
  const navigate = useNavigate()

  // No auto-redirect — landing page is always accessible independently

  return (
    <div className="landing-page landing-v2">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          <Logo size={26} />
          <span>{APP_NAME}</span>
        </Link>
        <nav className="landing-nav">
          <a href="#features" className="landing-nav-link">{t('navFeatures')}</a>
          <a href="#how" className="landing-nav-link">{t('navHow')}</a>
          <a href="#pricing" className="landing-nav-link">{t('navPricing')}</a>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => navigate('/login')}
          >
            {t('signInCta')}
          </button>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="landing-hero hero-v2">
        <div className="hero-grain" aria-hidden />

        {/* Single cinematic B/W runner photo, full-width, auto-scrolling R→L */}
        <div className="hero-cine" aria-hidden>
          <img src="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=2400&q=80&auto=format" alt="" />
        </div>

        <motion.div
          className="landing-hero-content hero-content-v2 hero-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="hero-eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Sparkles size={12} /> {t('heroEyebrow')}
          </motion.span>
          <h1>
            {t('heroTitleA')}{' '}
            <span className="hero-gradient-text">{t('heroTitleHighlight')}</span>
            {t('heroTitleB')}
          </h1>
          <p>{t('heroSubtitleV2')}</p>

          <motion.div
            className="hero-actions-v2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <StoreBadges />
            <div className="hero-cta-row">
              <button
                type="button"
                className="hero-primary-cta"
                onClick={() => navigate('/login')}
              >
                {t('ctaTryFree14')}
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                className="hero-secondary-cta-v2"
                onClick={() => navigate('/login')}
              >
                <Play size={14} />
                {t('signInCta')}
              </button>
            </div>
          </motion.div>

          <motion.div
            className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="trust-item">
              <CheckCircle2 size={14} />
              <span>{t('trustStrava')}</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={14} />
              <span>{t('trustMultisport')}</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={14} />
              <span>{t('trustAI')}</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-integrations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <span className="hero-integrations-label">{t('socialProofIntegrationsLabel')}</span>
            <div className="hero-integrations-row">
              {['Strava', 'TrainingPeaks', 'Garmin', 'Apple Health'].map((name) => (
                <span key={name} className="hero-integration-logo">{name}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Animated gradient mesh/orb behind the mockup */}
        <div className="hero-orb" aria-hidden />

        {/* Premium dashboard mockup with calendar + SVG line chart */}
        <motion.div
          className="hero-mockup"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mockup-frame">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span /><span /><span />
              </div>
              <span className="mockup-title">{APP_NAME}</span>
              <div className="mockup-header-right">
                <span className="mockup-header-stat">CTL 52</span>
                <span className="mockup-header-dot" />
              </div>
            </div>
            <div className="mockup-body">
              {/* Coach hero card */}
              <div className="mockup-hero">
                <div className="mockup-badge">PEAK IA COACH</div>
                <div className="mockup-h2">{t('mockupHero')}</div>
              </div>

              {/* Metrics row with gradient cards */}
              <div className="mockup-metrics">
                {[
                  { l: 'Forma', v: '+18', c: 'var(--success)', g: 'linear-gradient(135deg, rgba(52,211,153,0.18), transparent)' },
                  { l: 'Carga', v: '342', c: 'var(--info)', g: 'linear-gradient(135deg, rgba(96,165,250,0.18), transparent)' },
                  { l: 'CTL', v: '52', c: 'var(--accent)', g: 'linear-gradient(135deg, rgba(34,197,94,0.18), transparent)' },
                  { l: 'ATL', v: '34', c: 'var(--warning)', g: 'linear-gradient(135deg, rgba(251,191,36,0.18), transparent)' },
                ].map((m, i) => (
                  <motion.div
                    key={m.l}
                    className="mockup-metric-v2"
                    style={{ background: m.g }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.07, duration: 0.4 }}
                  >
                    <small>{m.l}</small>
                    <strong style={{ color: m.c }}>{m.v}</strong>
                    <span className="mockup-metric-bar" style={{ background: m.c }} />
                  </motion.div>
                ))}
              </div>

              {/* Weekly Training mini-calendar */}
              <div className="mockup-calendar">
                <div className="mockup-calendar-header">
                  <span>Weekly Training</span>
                  <span className="mockup-calendar-week">W22 · 42km</span>
                </div>
                <div className="mockup-calendar-grid">
                  {[
                    { d: 'Mon', t: 'Run', s: 'run', v: '10.2k' },
                    { d: 'Tue', t: 'Bike', s: 'bike', v: '24.5k' },
                    { d: 'Wed', t: 'Run', s: 'run', v: '8.0k' },
                    { d: 'Thu', t: 'Rest', s: 'rest', v: '—' },
                    { d: 'Fri', t: 'Swim', s: 'swim', v: '1.8k' },
                    { d: 'Sat', t: 'Run', s: 'run', v: '16.4k' },
                    { d: 'Sun', t: 'Bike', s: 'bike', v: '32.0k' },
                  ].map((day) => (
                    <div key={day.d} className="mockup-calendar-day">
                      <span className="mockup-calendar-label">{day.d}</span>
                      <span className={`mockup-calendar-dot ${day.s}`} />
                      <span className="mockup-calendar-val">{day.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Trend — SVG line chart */}
              <div className="mockup-chart-section">
                <div className="mockup-chart-header">
                  <span>Performance Trend</span>
                  <span className="mockup-chart-badge">Fitness +8%</span>
                </div>
                <div className="mockup-chart-viz">
                  <svg viewBox="0 0 240 64" className="mockup-line-chart" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineFillGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,52 Q24,48 48,38 T96,32 T144,22 T192,16 T240,12"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="mockup-line-path"
                    />
                    <path
                      d="M0,52 Q24,48 48,38 T96,32 T144,22 T192,16 T240,12 L240,64 L0,64 Z"
                      fill="url(#lineFillGrad)"
                    />
                  </svg>
                  <div className="mockup-chart-labels">
                    <span>12 May</span>
                    <span>19 May</span>
                    <span>26 May</span>
                  </div>
                </div>
              </div>

              {/* Today's Plan row */}
              <div className="mockup-today">
                <div className="mockup-today-icon">
                  <Activity size={14} />
                </div>
                <div className="mockup-today-body">
                  <strong>Today's Plan</strong>
                  <small>Endurance Run · 45 min Z2</small>
                </div>
                <span className="mockup-today-status">✓ Ready</span>
              </div>
            </div>
          </div>
          <div className="mockup-glow" aria-hidden />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <span className="hero-scroll-label">Scroll</span>
          <ChevronDown size={14} className="hero-scroll-chevron" />
        </motion.div>
      </section>

      {/* ── Social proof / trust metrics ─────────────────────────────── */}
      <section className="landing-social-proof">
        <p className="social-proof-eyebrow reveal">{t('socialProofEyebrow')}</p>
        <div className="social-proof-metrics stagger-children">
          <motion.div className="social-proof-metric reveal" whileHover={{ y: -3 }}>
            <strong>{t('socialProofAthletes')}</strong>
            <span>{t('socialProofAthletesLabel')}</span>
          </motion.div>
          <motion.div className="social-proof-metric reveal" whileHover={{ y: -3 }}>
            <strong className="social-proof-rating">
              {t('socialProofRating')}
              <span className="social-proof-stars" aria-hidden>★★★★★</span>
            </strong>
            <span>{t('socialProofRatingLabel')}</span>
          </motion.div>
          <motion.div className="social-proof-metric reveal" whileHover={{ y: -3 }}>
            <strong>{t('socialProofClubs')}</strong>
            <span>{t('socialProofClubsLabel')}</span>
          </motion.div>
        </div>
      </section>

      {/* ── Sport icons / "para quién es" ─────────────────────────────── */}
      <section className="landing-audience">
        <p className="audience-eyebrow reveal">{t('forWhomEyebrow')}</p>
        <div className="audience-icons stagger-children">
          {[
            { I: Footprints, label: t('sportRun') },
            { I: Bike, label: t('sportBike') },
            { I: Waves, label: t('sportSwim') },
            { I: Trophy, label: t('sportTriathlon') },
            { I: Mountain, label: t('sportTrail') },
            { I: Activity, label: t('sportMulti') },
          ].map(({ I, label }) => (
            <div key={label} className="audience-icon reveal">
              <I size={20} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="landing-features features-v2">
        <div className="features-gradient-bg" aria-hidden />
        <h2 className="reveal">{t('featuresTitle')}</h2>
        <p className="section-subtitle reveal">{t('featuresSubtitle')}</p>
        <div className="landing-features-grid">
          {[
            { I: Brain, key: 'AiCoach', comingSoon: false },
            { I: LineChart, key: 'Analysis', comingSoon: true },
            { I: Zap, key: 'Training', comingSoon: false },
            { I: Trophy, key: 'Progress', comingSoon: false },
            { I: Activity, key: 'Calendar', comingSoon: true },
            { I: ChevronRight, key: 'Connections', comingSoon: false },
          ].map(({ I, key, comingSoon }, i) => (
            <motion.div
              key={key}
              className="landing-feature-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
            >
              <div className="landing-feature-icon-wrap">
                <div className="landing-feature-icon">
                  <I size={22} />
                </div>
                {comingSoon && (
                  <span className="feature-coming-soon">{language === 'es' ? 'Próximamente' : 'Coming soon'}</span>
                )}
              </div>
              <h3>{t(`feature${key}` as 'featureAiCoach')}</h3>
              <p>{t(`feature${key}Desc` as 'featureAiCoachDesc')}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how" className="landing-how-v2">
        <h2 className="reveal">{t('howTitle')}</h2>
        <div className="how-steps-v2">
          {([
            { n: '01', icon: Download, titleKey: 'howStep1Title', descKey: 'howStep1Desc' },
            { n: '02', icon: Brain, titleKey: 'howStep2Title', descKey: 'howStep2Desc' },
            { n: '03', icon: TrendingUp, titleKey: 'howStep3Title', descKey: 'howStep3Desc' },
          ] as const).map((s, i) => (
            <motion.div
              key={s.n}
              className="how-step-v2"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
            >
              <div className="how-step-v2-icon">
                <s.icon size={24} />
              </div>
              <span className="how-step-num-v2">{s.n}</span>
              <h3>{t(s.titleKey)}</h3>
              <p>{t(s.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="landing-pricing">
        <h2 className="reveal">{t('pricingTitle')}</h2>
        <p className="section-subtitle reveal">{t('pricingSubtitle')}</p>
        <div className="pricing-grid pricing-grid-4">
          {/* Free — subdued, low-friction entry */}
          <motion.div className="landing-pricing-card pricing-card-free reveal" whileHover={{ y: -4 }}>
            <div className="pricing-tier">Free</div>
            <div className="landing-pricing-amount">
              <span className="landing-price">$0</span>
              <span className="landing-price-period">USD</span>
            </div>
            <p className="landing-price-annual">{language === 'es' ? 'Para siempre' : 'Forever'}</p>
            <ul className="landing-pricing-features pricing-features-icons">
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Conexión con Strava' : 'Strava connection'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Dashboard CTL/ATL/TSB' : 'CTL/ATL/TSB dashboard'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? '20 consultas IA/mes (BYOK)' : '20 AI queries/mo (BYOK)'}</span></li>
            </ul>
            <button type="button" className="pricing-btn" onClick={() => navigate('/login')}>
              {language === 'es' ? 'Empezar gratis' : 'Start free'}
            </button>
          </motion.div>

          {/* Pro mensual */}
          <motion.div className="landing-pricing-card pricing-card-pro reveal" whileHover={{ y: -4 }}>
            <div className="pricing-tier pricing-tier-pro"><Crown size={13} /> Pro · {language === 'es' ? 'Mensual' : 'Monthly'}</div>
            <div className="landing-pricing-amount">
              <span className="landing-price">COP$30.000</span>
              <span className="landing-price-period">/ {language === 'es' ? 'mes' : 'mo'}</span>
            </div>
            <p className="landing-price-annual">{language === 'es' ? 'Flexible, cancela cuando quieras' : 'Flexible, cancel anytime'}</p>
            <ul className="landing-pricing-features pricing-features-icons">
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Coach IA ilimitado' : 'Unlimited AI coach'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Planes multi-deporte' : 'Multi-sport plans'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Análisis avanzado' : 'Advanced analysis'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Sin anuncios' : 'No ads'}</span></li>
            </ul>
            <button type="button" className="pricing-btn" onClick={() => navigate('/login')}>
              {language === 'es' ? 'Elegir mensual' : 'Choose monthly'}
            </button>
          </motion.div>

          {/* Pro anual — destacado */}
          <motion.div className="landing-pricing-card pricing-card-featured reveal-scale" whileHover={{ y: -6 }}>
            <span className="pricing-popular pricing-popular-featured">{language === 'es' ? '⭐ Mejor valor' : '⭐ Best value'}</span>
            <div className="pricing-tier pricing-tier-pro"><Crown size={13} /> Pro · {language === 'es' ? 'Anual' : 'Annual'}</div>
            <div className="landing-pricing-amount">
              <span className="landing-price">COP$300.000</span>
              <span className="landing-price-period">/ {language === 'es' ? 'año' : 'yr'}</span>
            </div>
            <p className="landing-price-annual landing-price-savings">{language === 'es' ? 'Ahorra 17% · 2 meses gratis' : 'Save 17% · 2 months free'}</p>
            <ul className="landing-pricing-features pricing-features-icons">
              <li><CheckCircle2 size={14} className="feature-check-icon featured-check-icon" /><span>{language === 'es' ? 'Todo lo de Pro' : 'Everything in Pro'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon featured-check-icon" /><span>{language === 'es' ? 'Planes generados por IA' : 'AI-generated plans'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon featured-check-icon" /><span>{language === 'es' ? 'Múltiples modelos IA' : 'Multiple AI models'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon featured-check-icon" /><span>{language === 'es' ? 'Soporte prioritario' : 'Priority support'}</span></li>
            </ul>
            <button type="button" className="pricing-btn pricing-btn-featured" onClick={() => navigate('/login')}>
              {language === 'es' ? 'Elegir anual' : 'Choose annual'}
            </button>
          </motion.div>

          {/* Equipos */}
          <motion.div className="landing-pricing-card pricing-card-teams reveal" whileHover={{ y: -4 }}>
            <div className="pricing-tier pricing-tier-teams">{language === 'es' ? 'Equipos' : 'Teams'}</div>
            <div className="landing-pricing-amount">
              <span className="landing-price">{language === 'es' ? 'A medida' : 'Custom'}</span>
            </div>
            <p className="landing-price-annual">{language === 'es' ? 'Clubes y entrenadores' : 'Clubs & coaches'}</p>
            <ul className="landing-pricing-features pricing-features-icons">
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Multi-atleta' : 'Multi-athlete'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Panel de entrenador' : 'Coach dashboard'}</span></li>
              <li><CheckCircle2 size={14} className="feature-check-icon" /><span>{language === 'es' ? 'Facturación unificada' : 'Unified billing'}</span></li>
            </ul>
            <a className="pricing-btn" href="mailto:hola@peakendurance.app">
              {language === 'es' ? 'Contáctanos' : 'Contact us'}
            </a>
          </motion.div>
        </div>

        {/* Micro-copy: sin compromiso + trust */}
        <p className="pricing-no-commitment">{language === 'es' ? 'Sin compromiso · Cancela cuando quieras · Sin tarjeta de crédito' : 'No commitment · Cancel anytime · No credit card required'}</p>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section id="download" className="landing-final-cta">
        <motion.div
          className="final-cta-card reveal-scale"
          whileHover={{ scale: 1.008 }}
        >
          <h2 className="final-cta-heading">{t('finalCtaTitle')}</h2>
          <p className="final-cta-subtitle">{t('finalCtaSubtitle')}</p>
          <StoreBadges centered />
          <button
            type="button"
            className="final-cta-btn"
            onClick={() => navigate('/login')}
          >
            {t('ctaTryFree14')}
          </button>
          <p className="final-cta-micro">
            {language === 'es' ? 'Empieza hoy — sin tarjeta de crédito' : 'Start today — no credit card required'}
          </p>
          <p className="final-cta-trust">
            {language === 'es' ? '🏃 Ya sea corredor, ciclista o triatleta' : '🏃 Runner, cyclist or triathlete'}
          </p>
        </motion.div>
      </section>

      <footer className="landing-footer reveal-fade">
        <div className="footer-content">
          <div className="footer-brand">
            <Logo size={22} />
            <span>{APP_NAME}</span>
          </div>
          <p>&copy; 2026 {APP_NAME}. {t('allRightsReserved')}</p>
          <div className="app-credits" style={{ marginTop: 8 }}>
            <a href="https://github.com/JORMS-FA" target="_blank" rel="noopener noreferrer">
              Developed by Jorman Fagua
            </a>
          </div>
        </div>
      </footer>

      {/* AMOLED ambient lava-lamp background (replaces previous RGB strip) */}
      <LavaBackground />
    </div>
  )
}
