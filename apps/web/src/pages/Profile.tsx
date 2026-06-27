import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { useGamification } from '../hooks/useGamification'
import { Trophy, Medal, Star, Lock, ChevronRight, QrCode, Share2, Camera, Settings2, UserPlus, Activity, BarChart3, Route, Gauge, Printer, Pencil, X, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import '../styles/04-profile-public.css'
import '../styles/15-profile-public.css'
export function Profile() {
  const { language } = useI18n()
  const { profile } = useAuth()
  const gamification = useGamification()

  const isEs = language === 'es'
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editAvatarRef = useRef<HTMLInputElement>(null)

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
        <button type="button" className="profile-filter-chip active">
          <Star size={14} /> {isEs ? 'Vuelta ciclística' : 'Cycling ride'}
        </button>
        <button type="button" className="profile-filter-chip">
          <Activity size={14} /> {isEs ? 'Carrera' : 'Run'}
        </button>
        <button type="button" className="profile-filter-chip">
          <BarChart3 size={14} /> {isEs ? 'Entrenamiento con...' : 'Training with...'}
        </button>
      </motion.section>

      <motion.section className="profile-strava-week" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <h2 className="profile-strava-section-title">{isEs ? 'Esta semana' : 'This week'}</h2>
        <div className="profile-strava-week-metrics">
          <div className="profile-week-metric">
            <span className="profile-week-value">74,3 km</span>
            <span className="profile-week-label">{isEs ? 'Distancia' : 'Distance'}</span>
          </div>
          <div className="profile-week-metric">
            <span className="profile-week-value">2 h 54 min</span>
            <span className="profile-week-label">{isEs ? 'Duración' : 'Duration'}</span>
          </div>
          <div className="profile-week-metric">
            <span className="profile-week-value">979 m</span>
            <span className="profile-week-label">{isEs ? 'Desnivel positivo' : 'Elevation Gain'}</span>
          </div>
        </div>
        <div className="profile-week-chart">
          <div className="profile-week-chart-bars">
            {[167, 120, 80, 45, 90, 60, 74].map((v, i) => (
              <div key={i} className="profile-week-bar-wrap" style={{ height: `${(v / 167) * 100}%` }}>
                <div className="profile-week-bar" />
              </div>
            ))}
          </div>
          <div className="profile-week-chart-axis">
            <span>ABR.</span>
            <span>MAY.</span>
            <span>JUN.</span>
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
