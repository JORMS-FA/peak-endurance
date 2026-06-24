import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Bike,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Crown,
  Download,
  Footprints,
  LayoutDashboard,
  LineChart,
  Mountain,
  Play,
  Sparkles,
  TrendingUp,
  Trophy,
  Waves,
  Zap,
} from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { APP_NAME } from '@/lib/constants'
import { LavaBackground } from '@/components/ui/LavaBackground'
import { Logo } from '@/components/ui/Logo'
import { StoreBadges } from '@/components/ui/StoreBadges'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

/* ── SVG integration icons ───────────────────────────────────── */
const INTEGRATION_ICONS: Record<string, React.ReactNode> = {
  strava: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.387 17.944 12 24l-3.387-6.056h6.774Z" fill="#FC4C02" />
      <path d="M12 13.22 9.224 7.543l-.005.01L12 7.553l2.781-.005L12 13.22Z" fill="#FC4C02" />
      <path d="M12 7.553V.5L7.563 12.59H4.5L12 24V13.22l2.78-5.668L12 7.553Z" fill="#FC4C02" opacity="0.6" />
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
      <path d="M4 17.5 12 4l8 13.5H4Z" stroke="#60A5FA" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M7 17.5 12 9l5 8.5H7Z" fill="#60A5FA" opacity="0.35" />
    </svg>
  ),
  suunto: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#34d399" strokeWidth="1.8" fill="none" />
      <path d="M12 5v7l4 2" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  ),
  polar: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 3 2 5 5 1-4 4 1 5-5-3-5 3 1-5-4-4 1 5-5Z" fill="#f472b6" />
    </svg>
  ),
  coros: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12h16M8 6l8 12M16 6 8 18" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  zwift: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 5h12L8 19h10" stroke="#A855F7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
}

/* ── Hero visual: sunset trail-runner photograph ────────────── */
const HERO_IMAGE =
  'https://v3b.fal.media/files/b/0a9f7ab2/TaUhP2CzEsPsOm9VKb0VR_zx6KYZo7.png'

/* Maps audience sport card to a B&W image */
const SPORT_IMAGES: Record<string, string> = {
  run: 'https://v3b.fal.media/files/b/0a9f7ab3/jvs2XBV2AITg1nXOPyt-2_d4eQEjDV.png',
  bike: 'https://v3b.fal.media/files/b/0a9f7ab4/TmO6K8v5p9wa46NVfK2tI_x3UiInvR.png',
  swim: 'https://v3b.fal.media/files/b/0a9f7ab5/ASEOQraN21UHlHM46rdth_aXVML7LM.png',
  triathlon: 'https://v3b.fal.media/files/b/0a9f9de7/yHrDnh71NJiKykGHz-igN_T0YzCGKF.png',
  trail: 'https://v3b.fal.media/files/b/0a9f7ab6/22Y_192GFlP2r7OdQdI3U_Q7J76Xru.png',
  multi: 'https://v3b.fal.media/files/b/0a9f7ab2/TaUhP2CzEsPsOm9VKb0VR_zx6KYZo7.png',
}

const SPRING = { type: 'spring' as const, stiffness: 400, damping: 15 }

/* ═══════════════════════════════════════════════════════════════ */

export function Landing() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing-page landing-v3">
      {/* ── Header / Navigation ─────────────────────────────────────── */}
      <header className={`landing-header-v3${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="landing-brand-v3">
          <span className="landing-logo-v3">
            <Logo size={26} />
          </span>
          <span className="landing-brand-name">PEAK ENDURANCE</span>
        </Link>

        <nav className="landing-nav-v3">
          <a href="#features" className="landing-nav-link-v3">{language === 'es' ? 'Características' : 'Features'}</a>
          <a href="#how" className="landing-nav-link-v3">{language === 'es' ? 'Cómo funciona' : 'How it works'}</a>
          <a href="#pricing" className="landing-nav-link-v3">{language === 'es' ? 'Precios' : 'Pricing'}</a>
          <a href="#testimonials" className="landing-nav-link-v3">{language === 'es' ? 'Testimonios' : 'Testimonials'}</a>
        </nav>

        <div className="landing-header-actions">
          <button
            type="button"
            className="btn-ghost-outline"
            onClick={() => navigate('/login')}
          >
            {language === 'es' ? 'Iniciar sesión' : 'Sign in'}
          </button>
          <motion.button
            type="button"
            className="btn-orange-cta"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
          >
            {language === 'es' ? 'Comenzar ahora' : 'Get started'}
          </motion.button>
        </div>
      </header>

      {/* ── Hero — Split L/R ────────────────────────────────────────── */}
      <section className="hero-split section-accent-rgb">
        <div className="hero-split-grid">
          {/* Left: text */}
          <div className="hero-split-left">
            <motion.span
              className="hero-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Sparkles size={13} />
              {language === 'es' ? 'NUEVA ERA DEL ENTRENAMIENTO' : 'A NEW ERA OF TRAINING'}
            </motion.span>

            <motion.h1
              className="hero-split-title"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {language === 'es' ? (
                <>
                  La fusión de{' '}
                  <span className="hero-gradient-rgb">Strava</span>{' '}
                  y{' '}
                  <span className="hero-gradient-rgb">TrainingPeaks</span>{' '}
                  impulsada por IA
                </>
              ) : (
                <>
                  The{' '}
                  <span className="hero-gradient-rgb">Strava</span>{' '}
                  +{' '}
                  <span className="hero-gradient-rgb">TrainingPeaks</span>{' '}
                  fusion, powered by AI
                </>
              )}
            </motion.h1>

            <motion.p
              className="hero-split-subtitle"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {language === 'es'
                ? 'Un coach inteligente que vive contigo, analiza tu carga y ajusta tu plan cada día.'
                : 'An intelligent coach that lives with you, analyses your load and tunes your plan every day.'}
            </motion.p>

            <motion.div
              className="hero-split-cta-row"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.button
                type="button"
                className="hero-primary-cta"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
              >
                {t('ctaTryFree14')}
                <ArrowRight size={15} />
              </motion.button>
              <motion.button
                type="button"
                className="hero-secondary-cta-v2"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
              >
                <Play size={14} />
                {language === 'es' ? 'Ver cómo funciona' : 'See how it works'}
              </motion.button>
            </motion.div>
          </div>

          {/* Right: image + floating dashboard card */}
          <div className="hero-split-right">
            <motion.div
              className="hero-visual-frame"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={HERO_IMAGE} alt="" className="hero-visual-img" loading="eager" />
              <div className="hero-visual-overlay" aria-hidden />
            </motion.div>

            <motion.div
              className="hero-float-card glass-card-elevated"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="float-card-head">
                <div>
                  <p className="float-greeting">
                    {language === 'es' ? 'Hola, Jorman' : 'Hi, Jorman'} <span aria-hidden>👋</span>
                  </p>
                  <p className="float-subtext">
                    {language === 'es' ? 'Listo para superar tus límites hoy.' : 'Ready to push your limits today.'}
                  </p>
                </div>
                <span className="float-status">
                  <span className="status-dot dot-green" />
                  {language === 'es' ? 'En forma' : 'In form'}
                </span>
              </div>

              <div className="float-metrics">
                <FloatMetric
                  label={language === 'es' ? 'Fitness' : 'Fitness'}
                  sub="CTL"
                  value={78}
                  change="+5"
                  changeTone="green"
                  lineColor="#f97316"
                />
                <FloatMetric
                  label={language === 'es' ? 'Fatiga' : 'Fatigue'}
                  sub="ATL"
                  value={42}
                  change="-3"
                  changeTone="orange"
                  lineColor="#3b82f6"
                />
                <FloatMetric
                  label={language === 'es' ? 'Forma' : 'Form'}
                  sub="TSB"
                  value={18}
                  prefix="+"
                  badge={language === 'es' ? 'Óptimo' : 'Optimal'}
                  changeTone="green"
                  lineColor="#22c55e"
                />
              </div>

              <button
                type="button"
                className="float-cta"
                onClick={() => navigate('/login')}
              >
                {language === 'es' ? 'Ver análisis completo' : 'View full analysis'}
                <ArrowRight size={13} />
              </button>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span className="hero-scroll-label">Scroll</span>
          <ChevronDown size={14} className="hero-scroll-chevron" />
        </motion.div>
      </section>

      {/* ── Social proof / Trust bar ─────────────────────────────────── */}
      <section className="landing-trust-bar">
        <p className="trust-bar-eyebrow reveal">
          {language === 'es' ? 'CONFIANZA DE ATLETAS Y ENTRENADORES' : 'TRUSTED BY ATHLETES & COACHES'}
        </p>
        <div className="trust-brands-row">
          {['STRAVA', 'TRAININGPEAKS', 'GARMIN', 'SUUNTO', 'POLAR', 'COROS'].map((b) => (
            <span key={b} className="trust-brand">{b}</span>
          ))}
        </div>
        <div className="trust-stats-row stagger-children">
          <motion.div className="trust-stat reveal" whileHover={{ scale: 1.05, y: -3, transition: SPRING }}>
            <strong>
              <AnimatedNumber value={10000} suffix="+" />
            </strong>
            <span>{language === 'es' ? 'Atletas' : 'Athletes'}</span>
          </motion.div>
          <motion.div className="trust-stat reveal" whileHover={{ scale: 1.05, y: -3, transition: SPRING }}>
            <strong>★★★★★ 4.9</strong>
            <span>{language === 'es' ? 'Valoración' : 'Rating'}</span>
          </motion.div>
          <motion.div className="trust-stat reveal" whileHover={{ scale: 1.05, y: -3, transition: SPRING }}>
            <strong>
              <AnimatedNumber value={150} suffix="+" />
            </strong>
            <span>{language === 'es' ? 'Clubes' : 'Clubs'}</span>
          </motion.div>
        </div>
      </section>

      {/* ── Integration cards (3 columns) ─────────────────────────────── */}
      <section id="testimonials" className="landing-integrations section-accent-blue">
        <div className="integrations-grid stagger-children">
          {/* Left — Smart Sync */}
          <motion.div
            className="integration-card glass-card reveal section-accent-green"
            whileHover={{ scale: 1.02, y: -4, transition: SPRING }}
          >
            <span className="sync-pill">
              <span className="status-dot dot-green" />
              {language === 'es' ? 'Sincronización inteligente' : 'Smart sync'}
            </span>
            <h3>
              {language === 'es'
                ? 'Todos tus datos. Una sola plataforma.'
                : 'All your data. One platform.'}
            </h3>
            <div className="sync-logos">
              <span className="sync-logo">{INTEGRATION_ICONS.strava}<span>Strava</span></span>
              <span className="sync-plus">+</span>
              <span className="sync-logo">{INTEGRATION_ICONS.trainingpeaks}<span>TrainingPeaks</span></span>
            </div>
            <p className="sync-updated">
              <CheckCircle2 size={15} />
              {language === 'es' ? 'Actualizado ahora' : 'Updated just now'}
            </p>
          </motion.div>

          {/* Center — Dashboard preview */}
          <motion.div
            className="integration-card glass-card reveal section-accent-orange"
            whileHover={{ scale: 1.02, y: -4, transition: SPRING }}
          >
            <div className="dash-mock">
              <aside className="dash-mock-sidebar">
                <span className="dash-mock-item active">
                  <LayoutDashboard size={14} />
                  {language === 'es' ? 'Resumen' : 'Summary'}
                </span>
                {(
                  [
                    { n: language === 'es' ? 'Entrenamientos' : 'Workouts', I: null },
                    { n: language === 'es' ? 'Calendario' : 'Calendar', I: Calendar },
                    { n: language === 'es' ? 'Análisis' : 'Analysis', I: LineChart },
                    { n: language === 'es' ? 'Progreso' : 'Progress', I: TrendingUp },
                  ] as { n: string; I: typeof Calendar | null }[]
                ).map((it) => (
                  <span key={it.n} className="dash-mock-item">
                    {it.I ? <it.I size={13} /> : null}
                    {it.n}
                  </span>
                ))}
                <span className="dash-mock-item">
                  {language === 'es' ? 'Configuración' : 'Settings'}
                </span>
              </aside>
              <div className="dash-mock-main">
                <p className="dash-mock-title">{language === 'es' ? 'Esta semana' : 'This week'}</p>
                <div className="dash-mock-metrics">
                  {[
                    { n: language === 'es' ? 'Entrenamientos' : 'Workouts', v: '5' },
                    { n: language === 'es' ? 'Horas' : 'Hours', v: '7h45m' },
                    { n: language === 'es' ? 'Distancia' : 'Distance', v: '82.4km' },
                    { n: language === 'es' ? 'Carga' : 'Load', v: '512' },
                  ].map((m) => (
                    <div key={m.n} className="dash-mock-metric">
                      <strong>{m.v}</strong>
                      <small>{m.n}</small>
                    </div>
                  ))}
                </div>
                <div className="dash-mock-chart">
                  <p>{language === 'es' ? 'Evolución de rendimiento' : 'Performance trend'}</p>
                  <svg viewBox="0 0 240 60" className="dash-mock-line">
                    <polyline points="0,45 40,30 80,38 120,20 160,26 200,10 240,16" fill="none" stroke="#f97316" strokeWidth="2" />
                    <polyline points="0,52 40,44 80,48 120,38 160,40 200,32 240,36" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  </svg>
                  <span className="dash-mock-dropdown">
                    {language === 'es' ? 'Últimos 6 semanas' : 'Last 6 weeks'}
                    <ChevronDown size={12} />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Testimonial */}
          <motion.div
            className="integration-card glass-card reveal section-accent-purple"
            whileHover={{ scale: 1.02, y: -4, transition: SPRING }}
          >
            <span className="testimonial-quote" aria-hidden>“</span>
            <p className="testimonial-text">
              {language === 'es'
                ? 'Desde que uso Peak Endurance mi rendimiento ha mejorado como nunca. Es como tener un coach 24/7 en mi bolsillo.'
                : 'Since using Peak Endurance my performance has improved like never before. It’s like having a 24/7 coach in my pocket.'}
            </p>
            <div className="testimonial-author">
              <span className="testimonial-avatar" aria-hidden>ML</span>
              <div>
                <strong>María López</strong>
                <small>{language === 'es' ? 'Atleta de trail running' : 'Trail running athlete'}</small>
              </div>
            </div>
            <div className="testimonial-dots">
              <span className="dot active" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="landing-features features-v2 section-accent-blue">
        <div className="features-gradient-bg" aria-hidden />
        <h2 className="reveal">{t('featuresTitle')}</h2>
        <div className="landing-features-grid">
          {[
            { I: Brain, key: 'AiCoach', comingSoon: false, accentClass: 'section-accent-orange' },
            { I: LineChart, key: 'Analysis', comingSoon: true, accentClass: 'section-accent-blue' },
            { I: Zap, key: 'Training', comingSoon: false, accentClass: 'section-accent-purple' },
            { I: Trophy, key: 'Progress', comingSoon: false, accentClass: 'section-accent-cyan' },
            { I: Calendar, key: 'Calendar', comingSoon: true, accentClass: 'section-accent-green' },
            { I: ChevronRight, key: 'Connections', comingSoon: false, accentClass: 'section-accent-pink' },
          ].map(({ I, key, comingSoon, accentClass }, i) => (
            <motion.div
              key={key}
              className={`landing-feature-card ${accentClass}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.03, y: -6, transition: SPRING }}
            >
              <div className="landing-feature-icon-wrap">
                <div className="landing-feature-icon">
                  <I size={24} />
                </div>
                {comingSoon && (
                  <span className="feature-coming-soon">
                    {language === 'es' ? 'Próximamente' : 'Coming soon'}
                  </span>
                )}
              </div>
              <h3>{t(`feature${key}` as 'featureAiCoach')}</h3>
              <p>{t(`feature${key}Desc` as 'featureAiCoachDesc')}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Audience / sport icons ────────────────────────────────────── */}
      <section className="landing-audience section-accent-cyan">
        <p className="audience-eyebrow reveal">{t('forWhomEyebrow')}</p>
        <div className="audience-cards stagger-children">
          {[
            { I: Footprints, label: t('sportRun'), img: SPORT_IMAGES.run },
            { I: Bike, label: t('sportBike'), img: SPORT_IMAGES.bike },
            { I: Waves, label: t('sportSwim'), img: SPORT_IMAGES.swim },
            { I: Trophy, label: t('sportTriathlon'), img: SPORT_IMAGES.triathlon },
            { I: Mountain, label: t('sportTrail'), img: SPORT_IMAGES.trail },
            { I: Activity, label: t('sportMulti'), img: SPORT_IMAGES.multi },
          ].map(({ I, label, img }) => (
            <motion.div
              key={label}
              className="audience-card reveal"
              style={{ backgroundImage: `url(${img})` }}
              whileHover={{ scale: 1.04, transition: SPRING }}
            >
              <div className="audience-card-overlay" aria-hidden />
              <span className="audience-card-icon"><I size={22} /></span>
              <span className="audience-card-label">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how" className="landing-how-v2 section-accent-orange">
        <h2 className="reveal">{t('howTitle')}</h2>
        <div className="how-steps-v2">
          {([
            { n: '01', icon: Download, titleKey: 'howStep1Title', accentClass: 'section-accent-blue' },
            { n: '02', icon: Brain, titleKey: 'howStep2Title', accentClass: 'section-accent-green' },
            { n: '03', icon: TrendingUp, titleKey: 'howStep3Title', accentClass: 'section-accent-orange' },
          ] as const).map((s, i) => (
            <motion.div
              key={s.n}
              className={`how-step-v2 ${s.accentClass}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, y: -4, transition: SPRING }}
            >
              <div className="how-step-v2-icon">
                <s.icon size={24} />
              </div>
              <span className="how-step-num-v2">{s.n}</span>
              <h3>{t(s.titleKey)}</h3>
              <p>{t(`${s.titleKey}Desc` as 'howStep1Desc')}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section id="pricing" className="landing-pricing section-accent-pink">
        <h2 className="reveal">{t('pricingTitle')}</h2>
        <p className="section-subtitle reveal">{t('pricingSubtitle')}</p>
        <div className="pricing-grid pricing-grid-4">
          {/* Free */}
          <motion.div
            className="landing-pricing-card pricing-card-free reveal"
            whileHover={{ scale: 1.02, y: -4, transition: SPRING }}
          >
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
          <motion.div
            className="landing-pricing-card pricing-card-pro reveal"
            whileHover={{ scale: 1.02, y: -4, transition: SPRING }}
          >
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
          <motion.div
            className="landing-pricing-card pricing-card-featured reveal-scale"
            whileHover={{ scale: 1.03, y: -6, transition: SPRING }}
          >
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
          <motion.div
            className="landing-pricing-card pricing-card-teams reveal"
            whileHover={{ scale: 1.02, y: -4, transition: SPRING }}
          >
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

        <p className="pricing-no-commitment">
          {language === 'es'
            ? 'Sin compromiso · Cancela cuando quieras · Sin tarjeta de crédito'
            : 'No commitment · Cancel anytime · No credit card required'}
        </p>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section id="download" className="landing-final-cta section-accent-green">
        <motion.div
          className="final-cta-card reveal-scale"
          whileHover={{ scale: 1.01, transition: { type: 'spring', stiffness: 200, damping: 20 } }}
        >
          <h2 className="final-cta-heading">{t('finalCtaTitle')}</h2>
          <p className="final-cta-subtitle">{t('finalCtaSubtitle')}</p>
          <StoreBadges centered />
          <button type="button" className="final-cta-btn" onClick={() => navigate('/login')}>
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
            <span className="landing-logo-bw">
              <Logo size={22} />
            </span>
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

      {/* AMOLED ambient lava-lamp background */}
      <LavaBackground />
    </div>
  )
}

/* ── Floating dashboard metric sub-component ────────────────── */
function FloatMetric({
  label,
  sub,
  value,
  prefix = '',
  badge,
  change,
  changeTone,
  lineColor,
}: {
  label: string
  sub: string
  value: number
  prefix?: string
  badge?: string
  change: string
  changeTone: 'green' | 'orange'
  lineColor: string
}) {
  return (
    <div className="float-metric">
      <div className="float-metric-top">
        <span className="float-metric-label">{label} · {sub}</span>
        {change && (
          <span className={`float-metric-change change-${changeTone}`}>{change}</span>
        )}
      </div>
      <strong className="float-metric-value">
        {prefix}
        <AnimatedNumber value={value} duration={1400} />
      </strong>
      {badge && <span className="float-metric-badge">{badge}</span>}
      <svg viewBox="0 0 80 24" className="float-metric-line">
        <polyline
          points="0,18 14,14 28,16 42,9 56,11 70,5 80,7"
          fill="none"
          stroke={lineColor}
          strokeWidth="1.6"
        />
      </svg>
    </div>
  )
}