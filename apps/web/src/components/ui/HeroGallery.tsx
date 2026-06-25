import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import '@/styles/14-hero-gallery.css'

/* ── Types ─────────────────────────────────────────────────── */

export interface MetricData {
  label: string
  sub: string
  value: number
  prefix?: string
  badge?: string
  change?: string
  changeTone?: 'green' | 'orange'
  lineColor: string
}

export interface SlideData {
  image: string
  athlete: string
  greeting: string
  greetingSub: string
  status: string
  statusDot: 'green' | 'orange' | 'yellow'
  metrics: MetricData[]
}

/* ── Props ─────────────────────────────────────────────────── */

interface HeroGalleryProps {
  slides?: SlideData[]
  interval?: number
  language: 'es' | 'en'
  onNavigate: () => void
}

/* ── Default slides (English) ──────────────────────────────── */

const DEFAULT_SLIDES_EN: SlideData[] = [
  {
    image: 'https://v3b.fal.media/files/b/0a9f7ab3/jvs2XBV2AITg1nXOPyt-2_d4eQEjDV.png',
    athlete: 'Jorman',
    greeting: 'Hi, Jorman',
    greetingSub: 'Ready to push your limits today.',
    status: 'In form',
    statusDot: 'green',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 78, change: '+5', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatigue', sub: 'ATL', value: 42, change: '-3', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Form', sub: 'TSB', value: 18, prefix: '+', badge: 'Optimal', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
  {
    image: 'https://v3b.fal.media/files/b/0a9f7ab4/TmO6K8v5p9wa46NVfK2tI_x3UiInvR.png',
    athlete: 'Carlos',
    greeting: 'Hi, Carlos',
    greetingSub: 'Your bike power is climbing steadily.',
    status: 'In form',
    statusDot: 'green',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 85, change: '+8', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatigue', sub: 'ATL', value: 55, change: '-5', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Form', sub: 'TSB', value: 30, prefix: '+', badge: 'Excelent', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
  {
    image: 'https://v3b.fal.media/files/b/0a9f7ab5/ASEOQraN21UHlHM46rdth_aXVML7LM.png',
    athlete: 'Ana',
    greeting: 'Hi, Ana',
    greetingSub: 'Recovery is the real training.',
    status: 'Recovery',
    statusDot: 'yellow',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 62, change: '+3', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatigue', sub: 'ATL', value: 38, change: '-12', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Form', sub: 'TSB', value: 24, prefix: '+', badge: 'Optimal', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
  {
    image: 'https://v3b.fal.media/files/b/0a9f7ab6/22Y_192GFlP2r7OdQdI3U_Q7J76Xru.png',
    athlete: 'Marco',
    greeting: 'Hi, Marco',
    greetingSub: 'Trail season is your time to shine.',
    status: 'In form',
    statusDot: 'green',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 91, change: '+10', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatigue', sub: 'ATL', value: 61, change: '-7', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Form', sub: 'TSB', value: 30, prefix: '+', badge: 'Excelent', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
  {
    image: 'https://v3b.fal.media/files/b/0a9f9de7/yHrDnh71NJiKykGHz-igN_T0YzCGKF.png',
    athlete: 'Elena',
    greeting: 'Hi, Elena',
    greetingSub: 'Triathlon is all about consistency.',
    status: 'Intense',
    statusDot: 'orange',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 73, change: '+6', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatigue', sub: 'ATL', value: 48, change: '-1', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Form', sub: 'TSB', value: 25, prefix: '+', badge: 'Optimal', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
]

const DEFAULT_SLIDES_ES: SlideData[] = [
  {
    image: 'https://v3b.fal.media/files/b/0a9f7ab3/jvs2XBV2AITg1nXOPyt-2_d4eQEjDV.png',
    athlete: 'Jorman',
    greeting: 'Hola, Jorman',
    greetingSub: 'Listo para superar tus límites hoy.',
    status: 'En forma',
    statusDot: 'green',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 78, change: '+5', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatiga', sub: 'ATL', value: 42, change: '-3', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Forma', sub: 'TSB', value: 18, prefix: '+', badge: 'Óptimo', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
  {
    image: 'https://v3b.fal.media/files/b/0a9f7ab4/TmO6K8v5p9wa46NVfK2tI_x3UiInvR.png',
    athlete: 'Carlos',
    greeting: 'Hola, Carlos',
    greetingSub: 'Tu potencia en bici sube sin parar.',
    status: 'En forma',
    statusDot: 'green',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 85, change: '+8', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatiga', sub: 'ATL', value: 55, change: '-5', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Forma', sub: 'TSB', value: 30, prefix: '+', badge: 'Excelente', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
  {
    image: 'https://v3b.fal.media/files/b/0a9f7ab5/ASEOQraN21UHlHM46rdth_aXVML7LM.png',
    athlete: 'Ana',
    greeting: 'Hola, Ana',
    greetingSub: 'La recuperación es el verdadero entrenamiento.',
    status: 'Recuperación',
    statusDot: 'yellow',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 62, change: '+3', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatiga', sub: 'ATL', value: 38, change: '-12', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Forma', sub: 'TSB', value: 24, prefix: '+', badge: 'Óptimo', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
  {
    image: 'https://v3b.fal.media/files/b/0a9f7ab6/22Y_192GFlP2r7OdQdI3U_Q7J76Xru.png',
    athlete: 'Marco',
    greeting: 'Hola, Marco',
    greetingSub: 'La temporada de trail es tu momento.',
    status: 'En forma',
    statusDot: 'green',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 91, change: '+10', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatiga', sub: 'ATL', value: 61, change: '-7', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Forma', sub: 'TSB', value: 30, prefix: '+', badge: 'Excelente', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
  {
    image: 'https://v3b.fal.media/files/b/0a9f9de7/yHrDnh71NJiKykGHz-igN_T0YzCGKF.png',
    athlete: 'Elena',
    greeting: 'Hola, Elena',
    greetingSub: 'El triatlón se construye con constancia.',
    status: 'Intenso',
    statusDot: 'orange',
    metrics: [
      { label: 'Fitness', sub: 'CTL', value: 73, change: '+6', changeTone: 'green', lineColor: '#f97316' },
      { label: 'Fatiga', sub: 'ATL', value: 48, change: '-1', changeTone: 'orange', lineColor: '#3b82f6' },
      { label: 'Forma', sub: 'TSB', value: 25, prefix: '+', badge: 'Óptimo', changeTone: 'green', lineColor: '#22c55e' },
    ],
  },
]

/* ── Sparkline SVG data (same shape as existing FloatMetric) ─ */
const SPARKLINE_POINTS = '0,18 14,14 28,16 42,9 56,11 70,5 80,7'

/* ═══════════════════════════════════════════════════════════════ */

export function HeroGallery({
  slides = [],
  interval = 4500,
  language,
  onNavigate,
}: HeroGalleryProps) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* Resolve slides — use passed-in if available, else defaults */
  const resolvedSlides = slides.length > 0
    ? slides
    : language === 'es'
      ? DEFAULT_SLIDES_ES
      : DEFAULT_SLIDES_EN

  const current = resolvedSlides[index]

  /* Auto-rotation */
  const startRotation = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % resolvedSlides.length)
    }, interval)
  }, [interval, resolvedSlides.length])

  useEffect(() => {
    startRotation()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startRotation])

  /* Manual dot click — pause rotation momentarily, then resume */
  const goToSlide = useCallback(
    (i: number) => {
      setIndex(i)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % resolvedSlides.length)
      }, interval)
    },
    [interval, resolvedSlides.length],
  )

  /* Prevent render with invalid index */
  if (!current) return null

  return (
    <div className="hg-gallery">
      {/* ── Crossfade images ── */}
      <AnimatePresence>
        <motion.div
          key={index}
          className="hg-slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <img src={current.image} alt="" className="hg-image" loading="eager" />
          <div className="hg-overlay" aria-hidden />
        </motion.div>
      </AnimatePresence>

      {/* ── Pagination dots ── */}
      <div className="hg-dots">
        {resolvedSlides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`hg-dot${i === index ? ' active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goToSlide(i)}
          />
        ))}
      </div>

      {/* ── Floating glassmorphism card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="hg-float-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Card head */}
          <div className="hg-card-head">
            <div>
              <p className="hg-greeting">
                {current.greeting} <span aria-hidden>👋</span>
              </p>
              <p className="hg-greeting-sub">{current.greetingSub}</p>
            </div>
            <span className="hg-status">
              <span className={`hg-status-dot ${current.statusDot}`} />
              {current.status}
            </span>
          </div>

          {/* Metrics grid */}
          <div className="hg-metrics">
            {current.metrics.map((m) => (
              <div key={m.sub} className="hg-metric">
                <div className="hg-metric-top">
                  <span className="hg-metric-label">
                    {m.label} · {m.sub}
                  </span>
                  {m.change && (
                    <span className={`hg-metric-change ${m.changeTone ?? ''}`}>
                      {m.change}
                    </span>
                  )}
                </div>
                <strong className="hg-metric-value">
                  {m.prefix}
                  <AnimatedNumber value={m.value} duration={1400} />
                </strong>
                {m.badge && (
                  <span className="hg-metric-badge">{m.badge}</span>
                )}
                <svg viewBox="0 0 80 24" className="hg-metric-line">
                  <polyline
                    points={SPARKLINE_POINTS}
                    fill="none"
                    stroke={m.lineColor}
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button type="button" className="hg-cta" onClick={onNavigate}>
            {language === 'es' ? 'Ver análisis completo' : 'View full analysis'}
            <ArrowRight size={13} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
