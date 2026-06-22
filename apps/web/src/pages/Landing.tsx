import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Apple,
  Bike,
  Brain,
  CheckCircle2,
  ChevronRight,
  Footprints,
  LineChart,
  Mountain,
  Play,
  Smartphone,
  Sparkles,
  Trophy,
  Waves,
  Zap,
} from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { APP_NAME } from '../lib/constants'
import { LavaBackground } from '../components/ui/LavaBackground'

export function Landing() {
  const { t } = useI18n()
  const navigate = useNavigate()

  // No auto-redirect — landing page is always accessible independently

  return (
    <div className="landing-page landing-v2">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          <Mountain size={22} />
          <span>{APP_NAME}</span>
        </Link>
        <nav className="landing-nav">
          <a href="#features" className="landing-nav-link">{t('navFeatures')}</a>
          <a href="#how" className="landing-nav-link">{t('navHow')}</a>
          <a href="#pricing" className="landing-nav-link">{t('navPricing')}</a>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => navigate('/login')}
          >
            {t('signInCta')}
          </button>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="landing-hero hero-v2">
        <div className="hero-grain" aria-hidden />
        <motion.div
          className="landing-hero-content hero-content-v2"
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
            <a href="#download" className="store-badge store-badge-primary">
              <Smartphone size={20} />
              <div>
                <small>{t('downloadOn')}</small>
                <strong>Google Play</strong>
              </div>
            </a>
            <a href="#download" className="store-badge">
              <Apple size={20} />
              <div>
                <small>{t('downloadOn')}</small>
                <strong>App Store</strong>
              </div>
            </a>
            <button
              type="button"
              className="hero-secondary-cta"
              onClick={() => navigate('/login')}
            >
              <Play size={14} />
              {t('tryWebVersion')}
            </button>
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
        </motion.div>

        {/* Mockup of the dashboard, built with CSS so it stays sharp on any device */}
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
            </div>
            <div className="mockup-body">
              <div className="mockup-hero">
                <div className="mockup-badge">PEAK IA COACH</div>
                <div className="mockup-h2">{t('mockupHero')}</div>
              </div>
              <div className="mockup-metrics">
                {[
                  { l: 'Forma', v: '+18', c: 'var(--success)' },
                  { l: 'Carga', v: '342', c: 'var(--info)' },
                  { l: 'CTL', v: '52', c: 'var(--accent)' },
                  { l: 'ATL', v: '34', c: 'var(--warning)' },
                ].map((m, i) => (
                  <motion.div
                    key={m.l}
                    className="mockup-metric"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.07, duration: 0.4 }}
                  >
                    <small>{m.l}</small>
                    <strong style={{ color: m.c }}>{m.v}</strong>
                  </motion.div>
                ))}
              </div>
              <div className="mockup-chart">
                {[24, 38, 14, 52, 30, 0, 46].map((h, i) => (
                  <motion.span
                    key={i}
                    className="mockup-bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${h * 1.6}%` }}
                    transition={{ delay: 0.9 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mockup-glow" aria-hidden />
        </motion.div>
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
        <h2 className="reveal">{t('featuresTitle')}</h2>
        <p className="section-subtitle reveal">{t('featuresSubtitle')}</p>
        <div className="landing-features-grid stagger-children">
          {[
            { I: Brain, key: 'AiCoach' as const },
            { I: LineChart, key: 'Analysis' as const },
            { I: Zap, key: 'Training' as const },
            { I: Trophy, key: 'Progress' as const },
            { I: Activity, key: 'Calendar' as const },
            { I: ChevronRight, key: 'Connections' as const },
          ].map(({ I, key }) => (
            <div key={key} className="landing-feature-card reveal">
              <div className="landing-feature-icon">
                <I size={22} />
              </div>
              <h3>{t(`feature${key}` as 'featureAiCoach')}</h3>
              <p>{t(`feature${key}Desc` as 'featureAiCoachDesc')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how" className="landing-how">
        <h2 className="reveal">{t('howTitle')}</h2>
        <div className="how-steps stagger-children">
          {([
            { n: '01', titleKey: 'howStep1Title', descKey: 'howStep1Desc' },
            { n: '02', titleKey: 'howStep2Title', descKey: 'howStep2Desc' },
            { n: '03', titleKey: 'howStep3Title', descKey: 'howStep3Desc' },
          ] as const).map((s) => (
            <div key={s.n} className="how-step reveal">
              <span className="how-step-num">{s.n}</span>
              <h3>{t(s.titleKey)}</h3>
              <p>{t(s.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="landing-pricing">
        <h2 className="reveal">{t('pricingTitle')}</h2>
        <p className="section-subtitle reveal">{t('pricingSubtitle')}</p>
        <div className="pricing-grid">
          <motion.div
            className="landing-pricing-card pricing-card-free reveal"
            whileHover={{ y: -4 }}
          >
            <div className="pricing-tier">{t('tierFree')}</div>
            <div className="landing-pricing-amount">
              <span className="landing-price">$0</span>
              <span className="landing-price-period">USD / {t('pricingMonth')}</span>
            </div>
            <ul className="landing-pricing-features">
              <li>{t('freeFeature1')}</li>
              <li>{t('freeFeature2')}</li>
              <li>{t('freeFeature3')}</li>
            </ul>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              {t('startFree')}
            </button>
          </motion.div>

          <motion.div
            className="landing-pricing-card pricing-card-pro reveal-scale"
            whileHover={{ y: -6 }}
          >
            <span className="pricing-popular">{t('mostPopular')}</span>
            <div className="pricing-tier">{t('tierPro')}</div>
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
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section id="download" className="landing-final-cta">
        <motion.div
          className="final-cta-card reveal-scale"
          whileHover={{ scale: 1.005 }}
        >
          <h2>{t('finalCtaTitle')}</h2>
          <p>{t('finalCtaSubtitle')}</p>
          <div className="hero-actions-v2" style={{ justifyContent: 'center' }}>
            <a href="#" className="store-badge store-badge-primary">
              <Smartphone size={20} />
              <div>
                <small>{t('downloadOn')}</small>
                <strong>Google Play</strong>
              </div>
            </a>
            <a href="#" className="store-badge">
              <Apple size={20} />
              <div>
                <small>{t('downloadOn')}</small>
                <strong>App Store</strong>
              </div>
            </a>
          </div>
          <button
            type="button"
            className="hero-secondary-cta"
            onClick={() => navigate('/login')}
          >
            {t('tryWebVersion')}
          </button>
        </motion.div>
      </section>

      <footer className="landing-footer reveal-fade">
        <div className="footer-content">
          <div className="footer-brand">
            <Mountain size={18} />
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
