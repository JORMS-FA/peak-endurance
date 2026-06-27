import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Heart, Ruler, Weight, Timer, SkipForward } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import { LavaBackground } from '../components/ui/LavaBackground'
import { Logo } from '../components/ui/Logo'

type OnboardingData = {
  display_name: string
  gender: 'male' | 'female' | ''
  weight_kg: string
  height_cm: string
  age: string
  resting_hr: string
  max_hr: string
  pace_10k: string // min/km format like "5:30"
  sports: string[] // multi-select: which sports the athlete practises
  running_bests: Record<string, string> // { '5k': '22:30', '10k': '47:10', ... }
  best_distance: string // selected distance for the dropdown
  best_time: string // time for selected distance
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  weekly_hours: string
  hr_zone_method: 'auto' | 'custom'
  hr_zones: string[] // 5 zones as max values
}

const defaultData: OnboardingData = {
  display_name: '',
  gender: '',
  weight_kg: '',
  height_cm: '',
  age: '',
  resting_hr: '',
  max_hr: '',
  pace_10k: '',
  sports: [],
  running_bests: {},
  best_distance: '',
  best_time: '',
  experience_level: 'intermediate',
  weekly_hours: '5',
  hr_zone_method: 'auto',
  hr_zones: ['', '', '', '', ''],
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
}

export function Onboarding() {
  const { profile, refresh } = useAuth()
  const { language } = useI18n()
  const isEs = language === 'es'

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    ...defaultData,
    display_name: profile?.display_name ?? '',
  })
  const [saving, setSaving] = useState(false)

  const totalSteps = 4

  function next() {
    if (step < totalSteps - 1) {
      setDirection(1)
      setStep(step + 1)
    }
  }

  function prev() {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  function update(field: keyof OnboardingData, value: string) {
    setData({ ...data, [field]: value })
  }

  function patch(partial: Partial<OnboardingData>) {
    setData((d) => ({ ...d, ...partial }))
  }

  async function handleComplete() {
    if (!supabase || !profile) return
    setSaving(true)

    const payload: Record<string, unknown> = {
      onboarding_completed: true,
      display_name: data.display_name || profile.display_name,
    }

    if (data.weight_kg) payload.weight_kg = parseFloat(data.weight_kg)
    if (data.height_cm) payload.height_cm = parseFloat(data.height_cm)
    if (data.age) payload.age = parseInt(data.age)
    if (data.gender) payload.gender = data.gender
    if (data.resting_hr) payload.resting_hr = parseInt(data.resting_hr)
    if (data.max_hr) payload.max_hr = parseInt(data.max_hr)
    if (data.sports.length > 0) {
      payload.sports = data.sports
      payload.primary_sport = data.sports[0]
    }
    if (data.sports.includes('run')) {
      // keep only filled bests
      const bests = Object.fromEntries(
        Object.entries(data.running_bests).filter(([, v]) => v && v.trim()),
      )
      payload.running_bests = bests
      if (bests['10k']) payload.pace_10k = data.pace_10k || ''
    }
    if (data.best_distance && data.best_time) {
      payload.best_distance = data.best_distance
      payload.best_time = data.best_time
    }
    if (data.experience_level) payload.experience_level = data.experience_level
    if (data.weekly_hours) payload.weekly_hours = parseFloat(data.weekly_hours)

    await supabase.from('profiles').update(payload).eq('id', profile.id)
    localStorage.setItem(`peak_onboarding_done_${profile.id}`, '1')
    window.location.href = '/app'
  }

  async function handleSkip() {
    if (!supabase || !profile) return
    setSaving(true)
    // Update DB
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', profile.id)
    // Also store locally so the guard doesn't flash onboarding on reload
    localStorage.setItem(`peak_onboarding_done_${profile.id}`, '1')
    window.location.href = '/app'
  }

  return (
    <div className="onboarding-shell">
      <LavaBackground />
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Progress bar */}
        <div className="onboarding-progress">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`onboarding-dot ${i <= step ? 'active' : ''}`} />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            className="onboarding-step"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {step === 0 && (
              <StepWelcome data={data} update={update} isEs={isEs} avatarUrl={profile?.avatar_url} />
            )}
            {step === 1 && (
              <StepBody data={data} update={update} isEs={isEs} />
            )}
            {step === 2 && (
              <StepTraining data={data} update={update} patch={patch} isEs={isEs} />
            )}
            {step === 3 && (
              <StepZones data={data} update={update} isEs={isEs} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation — symmetric 3-button bar */}
        <div className="onboarding-nav">
          {step > 0 ? (
            <button type="button" className="onboarding-nav-btn btn-secondary" onClick={prev}>
              <ChevronLeft size={16} /> {isEs ? 'Atras' : 'Back'}
            </button>
          ) : (
            <div className="onboarding-nav-spacer" />
          )}

          <button
            type="button"
            className="onboarding-nav-btn btn-ghost"
            onClick={handleSkip}
            disabled={saving}
          >
            <SkipForward size={14} />
            {isEs ? 'Omitir' : 'Skip'}
          </button>

          {step < totalSteps - 1 ? (
            <button type="button" className="onboarding-nav-btn btn-primary" onClick={next}>
              {isEs ? 'Siguiente' : 'Next'} <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="onboarding-nav-btn btn-primary"
              onClick={handleComplete}
              disabled={saving}
            >
              {saving
                ? (isEs ? 'Guardando...' : 'Saving...')
                : (isEs ? 'Empezar' : 'Get started')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Step Components ──────────────────────────────────────────────────────────

function StepWelcome({ data, update, isEs, avatarUrl }: {
  data: OnboardingData
  update: (k: keyof OnboardingData, v: string) => void
  isEs: boolean
  avatarUrl?: string | null
}) {
  return (
    <div className="onboarding-content">
      <div className="onboarding-icon-wrap">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="onboarding-avatar" />
        ) : (
          <Logo size={56} />
        )}
      </div>
      <h2>{isEs ? 'Bienvenido a Peak Endurance' : 'Welcome to Peak Endurance'}</h2>
      <p className="text-muted">
        {isEs
          ? 'Personalicemos tu experiencia. Como te llamas?'
          : "Let's personalize your experience. What's your name?"}
      </p>
      <label className="onboarding-field">
        <span>{isEs ? 'Nombre' : 'Name'}</span>
        <input
          type="text"
          value={data.display_name}
          onChange={(e) => update('display_name', e.target.value)}
          placeholder={isEs ? 'Tu nombre' : 'Your name'}
          autoFocus
        />
      </label>
    </div>
  )
}

function StepBody({ data, update, isEs }: {
  data: OnboardingData
  update: (k: keyof OnboardingData, v: string) => void
  isEs: boolean
}) {
  return (
    <div className="onboarding-content">
      <div className="onboarding-icon-wrap">
        <Ruler size={36} />
      </div>
      <h2>{isEs ? 'Datos corporales' : 'Body metrics'}</h2>
      <p className="text-muted">
        {isEs ? 'Estos datos mejoran la precision de tus metricas.' : 'This improves your metrics accuracy.'}
      </p>
      <div className="onboarding-grid">
        <label className="onboarding-field">
          <span><Weight size={14} /> {isEs ? 'Peso (kg)' : 'Weight (kg)'}</span>
          <input
            type="number"
            value={data.weight_kg}
            onChange={(e) => update('weight_kg', e.target.value)}
            placeholder="70"
            min="30"
            max="200"
          />
        </label>
        <label className="onboarding-field">
          <span><Ruler size={14} /> {isEs ? 'Altura (cm)' : 'Height (cm)'}</span>
          <input
            type="number"
            value={data.height_cm}
            onChange={(e) => update('height_cm', e.target.value)}
            placeholder="175"
            min="100"
            max="250"
          />
        </label>
        <label className="onboarding-field">
          <span>{isEs ? 'Edad' : 'Age'}</span>
          <input
            type="number"
            value={data.age}
            onChange={(e) => update('age', e.target.value)}
            placeholder="30"
            min="12"
            max="99"
          />
        </label>
        <label className="onboarding-field">
          <span>{isEs ? 'Sexo' : 'Sex'}</span>
          <select
            value={data.gender}
            onChange={(e) => update('gender', e.target.value)}
          >
            <option value="">{isEs ? 'Seleccionar' : 'Select'}</option>
            <option value="male">{isEs ? 'Masculino' : 'Male'}</option>
            <option value="female">{isEs ? 'Femenino' : 'Female'}</option>
          </select>
        </label>
      </div>
    </div>
  )
}

function StepTraining({ data, update, patch, isEs }: {
  data: OnboardingData
  update: (k: keyof OnboardingData, v: string) => void
  patch: (partial: Partial<OnboardingData>) => void
  isEs: boolean
}) {
  const sports = [
    { value: 'run', label: 'Running', icon: '🏃' },
    { value: 'bike', label: isEs ? 'Ciclismo' : 'Cycling', icon: '🚴' },
    { value: 'swim', label: isEs ? 'Natación' : 'Swimming', icon: '🏊' },
    { value: 'triathlon', label: isEs ? 'Triatlón' : 'Triathlon', icon: '🏅' },
    { value: 'gym', label: isEs ? 'Gimnasio' : 'Gym', icon: '🏋️' },
    { value: 'walk', label: isEs ? 'Caminata' : 'Walking', icon: '🚶' },
  ]

  const levels = [
    { value: 'beginner', label: isEs ? 'Principiante' : 'Beginner' },
    { value: 'intermediate', label: isEs ? 'Intermedio' : 'Intermediate' },
    { value: 'advanced', label: isEs ? 'Avanzado' : 'Advanced' },
    { value: 'elite', label: isEs ? 'Elite' : 'Elite' },
  ]

  const distanceOptions = [
    { value: '5k', label: '5K', placeholder: '22:30' },
    { value: '10k', label: '10K', placeholder: '47:10' },
    { value: 'half', label: isEs ? 'Media maratón' : 'Half marathon', placeholder: '1:45:00' },
    { value: 'marathon', label: isEs ? 'Maratón' : 'Marathon', placeholder: '3:50:00' },
  ]

  function toggleSport(value: string) {
    const has = data.sports.includes(value)
    const next = has ? data.sports.filter((s) => s !== value) : [...data.sports, value]
    patch({ sports: next })
  }

  function setBest(key: string, value: string) {
    patch({ running_bests: { ...data.running_bests, [key]: value } })
  }

  const selectedDistance = distanceOptions.find((d) => d.value === data.best_distance)
  const timePlaceholder = selectedDistance?.placeholder ?? '00:00'

  const runSelected = data.sports.includes('run') || data.sports.includes('triathlon')

  return (
    <div className="onboarding-content">
      <div className="onboarding-icon-wrap">
        <Timer size={36} />
      </div>
      <h2>{isEs ? 'Tu entrenamiento' : 'Your training'}</h2>
      <p className="text-muted">
        {isEs ? '¿Qué deportes practicas? Elige uno o varios.' : 'Which sports do you practise? Pick one or more.'}
      </p>

      <div className="onboarding-sport-grid onboarding-sport-grid-centered">
        {sports.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`onboarding-sport-btn ${data.sports.includes(s.value) ? 'active' : ''}`}
            onClick={() => toggleSport(s.value)}
          >
            <span className="sport-emoji">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Running personal bests — only when running/triathlon is selected */}
      <AnimatePresence initial={false}>
        {runSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: 16 }}>
              <label className="onboarding-sublabel" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                {isEs ? 'Tu último mejor registro (opcional)' : 'Your latest best effort (optional)'}
              </label>
              <p className="text-muted" style={{ fontSize: '0.76rem', marginBottom: 10 }}>
                {isEs
                  ? 'Tu mejor esfuerzo reciente por distancia. El coach IA lo usa como contexto.'
                  : 'Your recent best effort per distance. The AI coach uses it as context.'}
              </p>
              <div className="onboarding-best-row">
                <label className="onboarding-field">
                  <span>{isEs ? 'Distancia' : 'Distance'}</span>
                  <select
                    value={data.best_distance}
                    onChange={(e) => update('best_distance', e.target.value)}
                  >
                    <option value="">{isEs ? 'Elegir distancia' : 'Choose distance'}</option>
                    {distanceOptions.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </label>
                <label className="onboarding-field">
                  <span>{isEs ? 'Tiempo' : 'Time'}</span>
                  <input
                    type="text"
                    value={data.best_time}
                    onChange={(e) => update('best_time', e.target.value)}
                    placeholder={timePlaceholder}
                    inputMode="numeric"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <label className="onboarding-field" style={{ marginTop: 16 }}>
        <span>{isEs ? 'Nivel de experiencia' : 'Experience level'}</span>
        <select
          value={data.experience_level}
          onChange={(e) => update('experience_level', e.target.value)}
        >
          {levels.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

function StepZones({ data, update, isEs }: {
  data: OnboardingData
  update: (k: keyof OnboardingData, v: string) => void
  isEs: boolean
}) {
  const zoneLabels = [
    { name: isEs ? 'Z1 — Recuperacion' : 'Z1 — Recovery', color: '#22c55e' },
    { name: isEs ? 'Z2 — Aerobico' : 'Z2 — Aerobic', color: '#3b82f6' },
    { name: isEs ? 'Z3 — Tempo' : 'Z3 — Tempo', color: '#eab308' },
    { name: isEs ? 'Z4 — Umbral' : 'Z4 — Threshold', color: '#f97316' },
    { name: isEs ? 'Z5 — Maximo' : 'Z5 — VO2max', color: '#ef4444' },
  ]

  function autoCalculateZones() {
    const maxHr = parseInt(data.max_hr) || 190
    const restHr = parseInt(data.resting_hr) || 60
    // Karvonen method
    const reserve = maxHr - restHr
    const zones = [
      Math.round(restHr + reserve * 0.6),
      Math.round(restHr + reserve * 0.7),
      Math.round(restHr + reserve * 0.8),
      Math.round(restHr + reserve * 0.9),
      maxHr,
    ]
    update('hr_zones', zones.join(','))
  }

  const currentZones = data.hr_zones.length === 5 ? data.hr_zones
    : (typeof data.hr_zones === 'string'
      ? (data.hr_zones as unknown as string).split(',')
      : ['', '', '', '', ''])

  return (
    <div className="onboarding-content">
      <div className="onboarding-icon-wrap">
        <Heart size={36} />
      </div>
      <h2>{isEs ? 'Zonas de frecuencia cardiaca' : 'Heart rate zones'}</h2>
      <p className="text-muted">
        {isEs ? 'Personaliza tus zonas o calculalas automaticamente.' : 'Customize your zones or auto-calculate them.'}
      </p>

      <div className="onboarding-grid" style={{ marginBottom: 12 }}>
        <label className="onboarding-field">
          <span>{isEs ? 'FC reposo' : 'Resting HR'}</span>
          <input
            type="number"
            value={data.resting_hr}
            onChange={(e) => update('resting_hr', e.target.value)}
            placeholder="60"
            min="30"
            max="100"
          />
        </label>
        <label className="onboarding-field">
          <span>{isEs ? 'FC maxima' : 'Max HR'}</span>
          <input
            type="number"
            value={data.max_hr}
            onChange={(e) => update('max_hr', e.target.value)}
            placeholder="190"
            min="120"
            max="220"
          />
        </label>
      </div>

      <button type="button" className="btn-outline btn-sm" onClick={autoCalculateZones} style={{ marginBottom: 12 }}>
        {isEs ? 'Calcular zonas automaticamente' : 'Auto-calculate zones'}
      </button>

      <div className="onboarding-zones">
        {zoneLabels.map((z, i) => (
          <div key={i} className="onboarding-zone-row">
            <div className="zone-color" style={{ background: z.color }} />
            <span className="zone-label">{z.name}</span>
            <input
              type="number"
              className="zone-input"
              value={currentZones[i] ?? ''}
              onChange={(e) => {
                const newZones = [...currentZones]
                newZones[i] = e.target.value
                update('hr_zones', newZones.join(','))
              }}
              placeholder={isEs ? 'bpm' : 'bpm'}
              min="60"
              max="220"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
