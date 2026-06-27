import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { useGamification } from '../hooks/useGamification'
import { useActivities, type SportFilter } from '../hooks/useActivities'
import { Trophy, Medal, Star, Lock, ChevronRight, QrCode, Share2, Camera, Settings2, UserPlus, Activity, BarChart3, Route, Gauge, Printer, Pencil, X, Check, Bike, Footprints } from 'lucide-react'
import type { ReactNode } from 'react'
import '../styles/04-profile-public.css'
import '../styles/15-profile-public.css'

type RangeKey = 'week' | 'month' | 'year'

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatKm(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CO' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDuration(minutes: number, isEs: boolean): string {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h <= 0) return `${m} min`
  return isEs ? `${h} h ${pad2(m)} min` : `${h}h ${pad2(m)}m`
}

function formatElevation(meters: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.max(0, meters))
}

function startOfWeek(d: Date): Date {
  const out = new Date(d)
  const day = (out.getDay() + 6) % 7 // Monday = 0
  out.setHours(0, 0, 0, 0)
  out.setDate(out.getDate() - day)
  return out
}

function bucketKey(date: Date, range: RangeKey): string {
  if (range === 'year') {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
  }
  if (range === 'month') {
    // Week-of-month, Mon-starting
    const start = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1))
    const diff = Math.floor((date.getTime() - start.getTime()) / (7 * 86400000))
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-W${pad2(diff + 1)}`
  }
  return date.toISOString().slice(0, 10)
}

function bucketLabel(date: Date, range: RangeKey, isEs: boolean): string {
  const dayShortEs = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
  const dayShortEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const monthShortEs = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const monthShortEn = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  if (range === 'year') {
    return (isEs ? monthShortEs : monthShortEn)[date.getMonth()]
  }
  if (range === 'month') {
    return `${pad2(date.getDate())}`
  }
  return (isEs ? dayShortEs : dayShortEn)[date.getDay()]
}

function buildBuckets(range: RangeKey): Date[] {
  const today = new Date()
  const out: Date[] = []
  if (range === 'week') {
    const start = startOfWeek(today)
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      out.push(d)
    }
  } else if (range === 'month') {
    const start = startOfWeek(new Date(today.getFullYear(), today.getMonth(), 1))
    const end = startOfWeek(today)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      out.push(new Date(d))
    }
  } else {
    const start = new Date(today.getFullYear(), 0, 1)
    for (let m = 0; m < 12; m += 1) {
      out.push(new Date(today.getFullYear(), m, 1))
    }
    void start
  }
  return out
}

// Demo data so the profile is meaningful even before the user logs in /
// before Strava activities are synced. Produces a realistic-looking
// week/month/year curve per sport.
function demoBuckets(range: RangeKey, sport: SportFilter): number[] {
  const buckets = buildBuckets(range)
  // Seed per (sport, range) so values are stable per session.
  let seed = 0
  const k = `${sport}|${range}`
  for (let i = 0; i < k.length; i += 1) seed = (seed * 31 + k.charCodeAt(i)) >>> 0
  const rand = (i: number) => {
    seed = (seed * 1664525 + 1013904223 + i * 2654435761) >>> 0
    return (seed % 1000) / 1000
  }
  const base = sport === 'bike' ? 85 : sport === 'run' ? 45 : sport === 'swim' ? 30 : sport === 'gym' ? 50 : 60
  const vol = range === 'week' ? 1 : range === 'month' ? 1.4 : 1.8
  return buckets.map((_, i) => Math.round((base + Math.sin(i / 1.7) * base * 0.6 + rand(i) * base * 0.5) * vol))
}
export function Profile() {
  const { language } = useI18n()
  const { profile } = useAuth()
  const gamification = useGamification()

  const isEs = language === 'es'
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [sportFilter, setSportFilter] = useState<SportFilter>('bike')
  const [range, setRange] = useState<RangeKey>('week')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editAvatarRef = useRef<HTMLInputElement>(null)

  const daysForRange = range === 'week' ? 7 : range === 'month' ? 35 : 365
  const { data: realActivities } = useActivities({ days: daysForRange, sport: sportFilter })

  const displayName = profile?.display_name ?? (isEs ? 'Atleta' : 'Athlete')
  const location = (profile as { location?: string })?.location ?? ''
  const handle = (profile as { instagram_handle?: string })?.instagram_handle ?? ''

  // Local state for the edit pop-up — initialised from the current profile.
  const [editName, setEditName] = useState(displayName)
  const [editLocation, setEditLocation] = useState(location)
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)

  useEffect(() => {
    if (editOpen) {
      setEditName(displayName)
      setEditLocation(location)
      setEditAvatarPreview(profile?.avatar_url ?? null)
    }
  }, [editOpen, displayName, location, profile?.avatar_url])

  const shownAchievements = useMemo(() => {
    const list = gamification.achievements
    if (showAllAchievements || list.length <= 6) return list
    return list.slice(0, 6)
  }, [gamification.achievements, showAllAchievements])

  const hasMore = gamification.achievements.length > 6 && !showAllAchievements

  // Build chart series — prefer real activities, fall back to a stable demo curve.
  const buckets = useMemo(() => buildBuckets(range), [range])

  const chartData = useMemo(() => {
    const series: { date: Date; minutes: number; km: number; elev: number; label: string }[] = buckets.map((date) => ({
      date,
      minutes: 0,
      km: 0,
      elev: 0,
      label: bucketLabel(date, range, isEs),
    }))

    if (realActivities.length > 0) {
      const idxByKey = new Map<string, number>()
      series.forEach((b, i) => idxByKey.set(bucketKey(b.date, range), i))
      for (const a of realActivities) {
        if (!a.date) continue
        const d = new Date(`${a.date}T12:00:00`)
        const key = bucketKey(d, range)
        const idx = idxByKey.get(key)
        if (idx === undefined) continue
        series[idx].minutes += a.duration_minutes ?? 0
        series[idx].km += a.distance_km ?? 0
        series[idx].elev += a.elevation_gain_m ?? 0
      }
    } else {
      // Demo: each demo unit ≈ 1 km (cycling) / 1 minute per bucket.
      const base = demoBuckets(range, sportFilter)
      base.forEach((v, i) => {
        const factorKm = sportFilter === 'bike' ? 1 : sportFilter === 'run' ? 0.5 : sportFilter === 'swim' ? 0.05 : sportFilter === 'gym' ? 0 : 0.6
        const factorMin = sportFilter === 'gym' ? 1.6 : sportFilter === 'swim' ? 0.6 : 0.7
        const factorElev = sportFilter === 'bike' ? 8 : sportFilter === 'run' ? 4 : sportFilter === 'swim' ? 0 : 0
        series[i].km = Math.round(v * factorKm)
        series[i].minutes = Math.round(v * factorMin)
        series[i].elev = Math.round(v * factorElev)
      })
    }

    return series
  }, [buckets, range, isEs, realActivities, sportFilter])

  const totalMinutes = useMemo(() => chartData.reduce((s, b) => s + b.minutes, 0), [chartData])
  const totalKm = useMemo(() => chartData.reduce((s, b) => s + b.km, 0), [chartData])
  const totalElev = useMemo(() => chartData.reduce((s, b) => s + b.elev, 0), [chartData])
  const maxKm = useMemo(() => Math.max(1, ...chartData.map((b) => b.km)), [chartData])

  const menuItems: { icon: ReactNode; label: string; sub: string }[] = [
    { icon: <Trophy size={16} />, label: isEs ? 'Resumen de la suscripción' : 'Subscription summary', sub: '' },
    { icon: <Activity size={16} />, label: isEs ? 'Actividades' : 'Activities', sub: isEs ? 'Hoy' : 'Today' },
    { icon: <BarChart3 size={16} />, label: isEs ? 'Estadísticas' : 'Statistics', sub: isEs ? 'Este año: 2,422.7 km' : 'This year: 1,505 mi' },
    { icon: <Route size={16} />, label: isEs ? 'Rutas' : 'Routes', sub: '35' },
    { icon: <Gauge size={16} />, label: isEs ? 'Segmentos' : 'Segments', sub: '70' },
    { icon: <Printer size={16} />, label: isEs ? 'Mejores tiempos' : 'Best efforts', sub: isEs ? 'Ver todo' : 'View all' },
    { icon: <Star size={16} />, label: isEs ? 'Publicaciones' : 'Posts', sub: '1' },
    { icon: <Trophy size={16} />, label: isEs ? 'Equipamiento' : 'Gear', sub: 'Venom : 13,472.3 km' },
  ]

  return (
    <div className="public-profile full-width">
      <motion.section className="profile-strava-header" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <button type="button" className="profile-strava-back" aria-label={isEs ? 'Atrás' : 'Back'}>
          <span className="sr-only">{isEs ? 'Atrás' : 'Back'}</span>
        </button>
        <button
          type="button"
          className="profile-strava-edit"
          aria-label={isEs ? 'Editar perfil' : 'Edit profile'}
          onClick={() => setEditOpen(true)}
        >
          <Pencil size={16} />
        </button>
      </motion.section>
      <motion.section className="profile-strava-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="profile-strava-hero-avatar">
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} />
          <button type="button" className="profile-strava-hero-avatar-btn profile-avatar-circle" onClick={() => fileInputRef.current?.click()}>
            <span className="profile-avatar-gradient" aria-hidden />
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-placeholder">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </button>
        </div>
        <h1 className="profile-strava-name">{displayName}</h1>
        {location && <p className="profile-strava-location">{location}</p>}
        <p className="profile-strava-sub">{isEs ? 'CON SUSCRIPCIÓN DESDE 2023' : 'SUBSCRIBED SINCE 2023'}</p>
        {handle && <p className="profile-strava-handle">IG @{handle}</p>}
      </motion.section>

      <motion.section className="profile-strava-stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="profile-strava-stat">
          <span className="profile-strava-stat-value">99</span>
          <span className="profile-strava-stat-label">{isEs ? 'Siguiendo' : 'Following'}</span>
        </div>
        <div className="profile-strava-stat">
          <span className="profile-strava-stat-value">54</span>
          <span className="profile-strava-stat-label">{isEs ? 'Seguidores' : 'Followers'}</span>
        </div>
        <div className="profile-strava-stat">
          <span className="profile-strava-stat-value">1,272</span>
          <span className="profile-strava-stat-label">{isEs ? 'Actividades' : 'Activities'}</span>
        </div>
        <div className="profile-strava-stat">
          <span className="profile-strava-stat-value">108</span>
          <span className="profile-strava-stat-label">{isEs ? 'Serie semanal' : 'Weekly streak'}</span>
        </div>
      </motion.section>

      <motion.section className="profile-strava-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <button type="button" className="profile-strava-btn outline">
          <QrCode size={16} /> {isEs ? 'Compartir mi código QR' : 'Share my QR code'}
        </button>
        <button type="button" className="profile-strava-btn outline">
          <Camera size={16} /> {isEs ? 'Editar' : 'Edit'}
        </button>
      </motion.section>

      <motion.section className="profile-strava-gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <div className="profile-strava-gallery-row">
          {['https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80'].map((src, idx) => (
            <button type="button" key={idx} className="profile-strava-gallery-item" style={{ backgroundImage: `url(${src})` }} />
          ))}
        </div>
      </motion.section>

      <motion.section className="profile-strava-filters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <button
          type="button"
          className={`profile-filter-chip ${sportFilter === 'bike' ? 'active' : ''}`}
          onClick={() => setSportFilter('bike')}
        >
          <Bike size={14} /> {isEs ? 'Vuelta ciclística' : 'Cycling ride'}
        </button>
        <button
          type="button"
          className={`profile-filter-chip ${sportFilter === 'run' ? 'active' : ''}`}
          onClick={() => setSportFilter('run')}
        >
          <Footprints size={14} /> {isEs ? 'Carrera' : 'Run'}
        </button>
        <button
          type="button"
          className={`profile-filter-chip ${sportFilter === 'gym' ? 'active' : ''}`}
          onClick={() => setSportFilter('gym')}
        >
          <BarChart3 size={14} /> {isEs ? 'Entrenamiento' : 'Training'}
        </button>
        <button
          type="button"
          className={`profile-filter-chip ${sportFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSportFilter('all')}
        >
          <Activity size={14} /> {isEs ? 'Todos' : 'All'}
        </button>
      </motion.section>

      <motion.section className="profile-strava-week" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="profile-strava-week-header">
          <h2 className="profile-strava-section-title">
            {range === 'week' ? (isEs ? 'Esta semana' : 'This week') : range === 'month' ? (isEs ? 'Este mes' : 'This month') : (isEs ? 'Este año' : 'This year')}
          </h2>
          <div className="profile-strava-range" role="tablist">
            {(['week', 'month', 'year'] as RangeKey[]).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                className={`profile-strava-range-btn ${range === r ? 'active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r === 'week' ? (isEs ? 'Semana' : 'Week') : r === 'month' ? (isEs ? 'Mes' : 'Month') : (isEs ? 'Año' : 'Year')}
              </button>
            ))}
          </div>
        </div>
        <div className="profile-strava-week-metrics">
          <div className="profile-week-metric">
            <span className="profile-week-value">{formatKm(totalKm, language)} km</span>
            <span className="profile-week-label">{isEs ? 'Distancia' : 'Distance'}</span>
          </div>
          <div className="profile-week-metric">
            <span className="profile-week-value">{formatDuration(totalMinutes, isEs)}</span>
            <span className="profile-week-label">{isEs ? 'Duración' : 'Duration'}</span>
          </div>
          <div className="profile-week-metric">
            <span className="profile-week-value">{formatElevation(totalElev)} m</span>
            <span className="profile-week-label">{isEs ? 'Desnivel positivo' : 'Elevation Gain'}</span>
          </div>
        </div>
        <div className="profile-week-chart" aria-label={isEs ? 'Volumen por periodo' : 'Volume per period'}>
          <div className="profile-week-chart-bars">
            {chartData.map((b, i) => {
              const heightPct = maxKm > 0 ? (b.km / maxKm) * 100 : 0
              return (
                <div key={i} className="profile-week-bar-wrap">
                  <motion.div
                    className="profile-week-bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(2, heightPct)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.04 * i }}
                    title={`${b.label}: ${formatKm(b.km, language)} km · ${formatDuration(b.minutes, isEs)}`}
                  />
                  <span className="profile-week-bar-label">{b.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      <motion.section className="profile-strava-menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {menuItems.map((item) => (
          <button key={item.label} type="button" className="profile-menu-row">
            <span className="profile-menu-icon">{item.icon}</span>
            <span className="profile-menu-text">{item.label}</span>
            {item.sub && <span className="profile-menu-sub">{item.sub}</span>}
            <span className="profile-menu-arrow"><ChevronRight size={16} /></span>
          </button>
        ))}
      </motion.section>

      <motion.section className="profile-strava-challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <div className="profile-strava-card-header">
          <span>{isEs ? 'Retos' : 'Challenges'}</span>
          <span className="profile-strava-count">15</span>
        </div>
        <div className="profile-strava-challenge-card">
          <span className="profile-challenge-icon"><Trophy size={18} /></span>
          <div>
            <strong>{isEs ? 'July 5K Challenge' : 'July 5K Challenge'}</strong>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>{isEs ? 'Comienza en 4 días' : 'Starts in 4 days'}</p>
          </div>
        </div>
        <button type="button" className="profile-show-more">{isEs ? 'Todos los retos' : 'All challenges'}</button>
      </motion.section>

      <motion.section className="profile-strava-trophies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <div className="profile-strava-card-header">
          <span>{isEs ? 'Vitrina de trofeos' : 'Trophy case'}</span>
          <span className="profile-strava-count">108</span>
        </div>
        <div className="profile-trophy-row">
          {['1000', 'Google Pixel', '100k', '30h'].map((label, idx) => (
            <div key={idx} className={`profile-trophy ${idx === 0 ? 'hex' : idx === 2 || idx === 3 ? 'round red' : 'square'}`}>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <button type="button" className="profile-show-more">{isEs ? 'Todos los trofeos' : 'All trophies'}</button>
      </motion.section>

      <motion.section className="profile-strava-clubs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
        <div className="profile-strava-card-header">
          <span>{isEs ? 'Clubes' : 'Clubs'}</span>
          <span className="profile-strava-count">43</span>
        </div>
        <div className="profile-club-row">
          {['CLUB MTB SE', 'CLUB REFUGI', 'Colombia', "Phil's Cookie C"].map((name, idx) => (
            <div key={name} className="profile-club">
              <span className={`profile-club-icon ${idx === 2 ? 'flag' : ''}`}>{idx === 2 ? '🇨🇴' : name.charAt(0)}</span>
              <span className="profile-club-name">{name}</span>
            </div>
          ))}
        </div>
        <button type="button" className="profile-show-more">{isEs ? 'Todos los clubes' : 'All clubs'}</button>
      </motion.section>

      <AnimatePresence>
        {editOpen && (
          <motion.div
            className="profile-edit-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditOpen(false)}
          >
            <motion.div
              className="profile-edit-popup"
              role="dialog"
              aria-modal="true"
              aria-label={isEs ? 'Editar perfil' : 'Edit profile'}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="profile-edit-header">
                <h3>{isEs ? 'Editar perfil' : 'Edit profile'}</h3>
                <button
                  type="button"
                  className="profile-edit-close"
                  aria-label={isEs ? 'Cerrar' : 'Close'}
                  onClick={() => setEditOpen(false)}
                >
                  <X size={16} />
                </button>
              </header>

              <div className="profile-edit-avatar">
                <input
                  type="file"
                  accept="image/*"
                  ref={editAvatarRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => setEditAvatarPreview(String(reader.result))
                    reader.readAsDataURL(file)
                  }}
                />
                <button
                  type="button"
                  className="profile-edit-avatar-btn"
                  onClick={() => editAvatarRef.current?.click()}
                >
                  <span className="profile-avatar-gradient" aria-hidden />
                  {editAvatarPreview ? (
                    <img src={editAvatarPreview} alt="" className="profile-avatar-img" />
                  ) : (
                    <span className="profile-avatar-placeholder">{editName.charAt(0).toUpperCase()}</span>
                  )}
                  <span className="profile-edit-avatar-camera">
                    <Camera size={14} />
                  </span>
                </button>
                <span className="profile-edit-avatar-hint">
                  {isEs ? 'Toca la foto para cambiarla' : 'Tap the photo to change it'}
                </span>
              </div>

              <div className="profile-edit-fields">
                <label className="profile-edit-field">
                  <span>{isEs ? 'Nombre' : 'Name'}</span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={isEs ? 'Tu nombre' : 'Your name'}
                  />
                </label>
                <label className="profile-edit-field">
                  <span>{isEs ? 'Descripción / Ubicación' : 'Description / Location'}</span>
                  <textarea
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder={isEs ? 'La Macarena, META' : 'La Macarena, META'}
                    rows={3}
                  />
                </label>
              </div>

              <footer className="profile-edit-footer">
                <button type="button" className="profile-edit-cancel" onClick={() => setEditOpen(false)}>
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="button" className="profile-edit-save" onClick={() => setEditOpen(false)}>
                  <Check size={14} /> {isEs ? 'Guardar' : 'Save'}
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
