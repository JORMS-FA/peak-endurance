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

/* ── SVG integration icons ───────────────────────────────────── */
const INTEGRATION_ICONS: Record<string, React.ReactNode> = {
  strava: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.387 17.944 12 24l-3.387-6.056h6.774Z"
        fill="#FC4C02"
      />
      <path
        d="M12 13.22 9.224 7.543l-.005.01L12 7.553l2.781-.005L12 13.22Z"
        fill="#FC4C02"
      />
      <path
        d="M12 7.553V.5L7.563 12.59H4.5L12 24V13.22l2.78-5.668L12 7.553Z"
        fill="#FC4C02"
        opacity="0.6"
      />
    </svg>
  ),
  trainingpeaks: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="12" width="4" height="10" rx="1" fill="#3B82F6" />
      <rect x="8" y="7" width="4" height="15" rx="1" fill="#3B82F6" opacity="0.8" />
      <rect x="14" y="3" width="4" height="19" rx="1" fill="#3B82F6" opacity="0.6" />
      <rect x="20" y="8" width="2" height="14" rx="1" fill="#3B82F6" opacity="0.4" />
    </svg>
  ),
  garmin: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 17.5 12 4l8 13.5H4Z"
        stroke="#60A5FA"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M7 17.5 12 9l5 8.5H7Z"
        fill="#60A5FA"
        opacity="0.35"
      />
    </svg>
  ),
  apple_health: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21.35c-.5-.45-1.2-1.08-1.9-1.85C7.6 16.6 4 12.8 4 8.5 4 5.97 6.01 4 8.5 4c1.42 0 2.7.67 3.5 1.7C12.8 4.67 14.08 4 15.5 4 17.99 4 20 5.97 20 8.5c0 4.3-3.6 8.1-6.1 11-.7.77-1.4 1.4-1.9 1.85Z"
        fill="#FF2D55"
      />
      <path
        d="M12 21.35c1.15-1.05 3.5-3.4 5.1-6.1.6-1 .9-2.1.9-3.25 0-1.5-.8-2.5-1.5-3"
        stroke="#FF2D55"
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  ),
}

/* ═══════════════════════════════════════════════════════════════ */

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
          <motion.button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {t('signInCta')}
          </motion.button>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="landing-hero hero-v2 section-accent-green">
        <div className="hero-grain" aria-hidden />

        {/* Cinematic background photo — subtle atmospheric layer */}
        <div className="hero-cine" aria-hidden>
          <img src="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=2400&q=80&auto=format" alt="" />
        </div>

        <div className="hero-split">
          {/* ── Left: Text content ── */}
          <div className="hero-text-side">
            <motion.span
              className="hero-eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Sparkles size={12} /> {t('heroEyebrow')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('heroTitleA')}{' '}
              <span className="hero-gradient-text">{t('heroTitleHighlight')}</span>
              {t('heroTitleB')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('heroSubtitleV2')}
            </motion.p>

            <motion.div
              className="hero-actions-v2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <StoreBadges />
              <div className="hero-cta-row">
                <motion.button
                  type="button"
                  className="hero-primary-cta"
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {t('ctaTryFree14')}
                  <ArrowRight size={14} />
                </motion.button>
                <motion.button
                  type="button"
                  className="hero-secondary-cta-v2"
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Play size={14} />
                  {t('signInCta')}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="hero-trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="trust-item">
                <Zap size={14} className="trust-icon" style={{ color: '#22c55e' }} />
                <span>{t('trustStrava')}</span>
              </div>
              <div className="trust-item">
                <Activity size={14} className="trust-icon" style={{ color: '#3b82f6' }} />
                <span>{t('trustMultisport')}</span>
              </div>
              <div className="trust-item">
                <Brain size={14} className="trust-icon" style={{ color: '#8b5cf6' }} />
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
                {[
                  { key: 'strava', name: 'Strava' },
                  { key: 'trainingpeaks', name: 'TrainingPeaks' },
                  { key: 'garmin', name: 'Garmin' },
                  { key: 'apple_health', name: 'Apple Health' },
                ].map(({ key, name }) => (
                  <motion.span
                    key={key}
                    className="hero-integration-logo"
                    whileHover={{ scale: 1.05, y: -2, transition: { type: "spring", stiffness: 400, damping: 15 } }}
                  >
                    {INTEGRATION_ICONS[key]}
                    {name}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Dashboard mockup ── */}
          <div className="hero-visual-side">
            <div className="hero-orb" aria-hidden />

            <motion.div
              className="hero-mockup"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 200, damping: 20 } }}
            >
              <div className="mockup-frame">
                <div className="mockup-shimmer" aria-hidden />
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
                        <span className="mockup-metric-pulse" style={{ background: m.c }} />
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
          </div>
        </div>

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
      <section className="landing-social-proof section-accent-purple">
        <p className="social-proof-eyebrow reveal">{t('socialProofEyebrow')}</p>
        <div className="social-proof-metrics stagger-children">
          <motion.div className="social-proof-metric reveal" whileHover={{ scale: 1.05, y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}>
            <strong>{t('socialProofAthletes')}</strong>
            <span>{t('socialProofAthletesLabel')}</span>
          </motion.div>
          <motion.div className="social-proof-metric reveal" whileHover={{ scale: 1.05, y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}>
            <strong className="social-proof-rating">
              {t('socialProofRating')}
              <span className="social-proof-stars" aria-hidden>★★★★★</span>
            </strong>
            <span>{t('socialProofRatingLabel')}</span>
          </motion.div>
          <motion.div className="social-proof-metric reveal" whileHover={{ scale: 1.05, y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}>
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
            <motion.div key={label} className="audience-icon reveal"
              whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 400, damping: 15 } }}
            >
              <I size={20} />
              <span>{label}</span>
            </motion.div>
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
            { I: Brain, key: 'AiCoach', comingSoon: false, accentClass: 'section-accent-green' },
            { I: LineChart, key: 'Analysis', comingSoon: true, accentClass: 'section-accent-blue' },
            { I: Zap, key: 'Training', comingSoon: false, accentClass: 'section-accent-orange' },
            { I: Trophy, key: 'Progress', comingSoon: false, accentClass: 'section-accent-purple' },
            { I: Activity, key: 'Calendar', comingSoon: true, accentClass: 'section-accent-cyan' },
            { I: ChevronRight, key: 'Connections', comingSoon: false, accentClass: 'section-accent-pink' },
          ].map(({ I, key, comingSoon, accentClass }, i) => (
            <motion.div
              key={key}
              className={`landing-feature-card ${accentClass}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.03, y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
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
            { n: '01', icon: Download, titleKey: 'howStep1Title', descKey: 'howStep1Desc', accentClass: 'section-accent-blue' },
            { n: '02', icon: Brain, titleKey: 'howStep2Title', descKey: 'howStep2Desc', accentClass: 'section-accent-green' },
            { n: '03', icon: TrendingUp, titleKey: 'howStep3Title', descKey: 'howStep3Desc', accentClass: 'section-accent-orange' },
          ] as const).map((s, i) => (
            <motion.div
              key={s.n}
              className={`how-step-v2 ${s.accentClass}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
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
          <motion.div className="landing-pricing-card pricing-card-free reveal" whileHover={{ scale: 1.02, y: -4, transition: { type: "spring", stiffness: 300, damping: 15 } }}>
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
          <motion.div className="landing-pricing-card pricing-card-pro reveal" whileHover={{ scale: 1.02, y: -4, transition: { type: "spring", stiffness: 300, damping: 15 } }}>
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
          <motion.div className="landing-pricing-card pricing-card-featured reveal-scale" whileHover={{ scale: 1.03, y: -6, transition: { type: "spring", stiffness: 300, damping: 15 } }}>
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
          <motion.div className="landing-pricing-card pricing-card-teams reveal" whileHover={{ scale: 1.02, y: -4, transition: { type: "spring", stiffness: 300, damping: 15 } }}>
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
          whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 200, damping: 20 } }}
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
