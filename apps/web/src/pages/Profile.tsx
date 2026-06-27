import { useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { useGamification } from '../hooks/useGamification'
import { Trophy, Medal, Star, Lock, ChevronRight, QrCode, Share2, Camera } from 'lucide-react'
import '../styles/15-profile-public.css'

export function Profile() {
  const { language } = useI18n()
  const { profile } = useAuth()
  const gamification = useGamification()

  const isEs = language === 'es'
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayName = profile?.display_name ?? (isEs ? 'Atleta' : 'Athlete')
  const location = (profile as { location?: string })?.location ?? ''

  const shownAchievements = useMemo(() => {
    const list = gamification.achievements
    if (showAllAchievements || list.length <= 6) return list
    return list.slice(0, 6)
  }, [gamification.achievements, showAllAchievements])

  const hasMore = gamification.achievements.length > 6 && !showAllAchievements

  return (
    <div className="public-profile">
      <motion.div
        className="public-profile-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="public-profile-hero-bg" />

        <div className="public-profile-hero-content">
          <div className="public-profile-hero-photo">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="public-profile-hero-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Cambiar foto"
            >
              <span className="public-profile-hero-photo-hex" aria-hidden />
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="public-profile-hero-photo-img" />
              ) : (
                <div className="public-profile-hero-photo-placeholder">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="public-profile-hero-photo-ring" aria-hidden />
              <span className="public-profile-hero-photo-badge">
                <Camera size={15} strokeWidth={2.5} />
              </span>
            </button>
          </div>

          <div className="public-profile-hero-identity">
            <h1 className="public-profile-hero-name">{displayName}</h1>
            {location && <p className="public-profile-hero-location">{location}</p>}
            <div className="public-profile-hero-badges">
              <span className="public-profile-badge level-badge">
                <Trophy size={12} /> Lv {gamification.level}
              </span>
              {gamification.unlockedCount === gamification.achievements.length && gamification.achievements.length > 0 && (
                <span className="public-profile-badge completion-badge">
                  <Medal size={12} /> {isEs ? 'Completo' : 'Complete'}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="public-profile-stats"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="public-profile-stat">
          <small>{isEs ? 'Logros' : 'Achievements'}</small>
          <strong>{gamification.unlockedCount}/{gamification.achievements.length}</strong>
          <div className="public-profile-stat-bar">
            <div
              className="public-profile-stat-fill achievement-fill"
              style={{
                width: `${gamification.achievements.length ? (gamification.unlockedCount / gamification.achievements.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <div className="public-profile-stat">
          <small>{isEs ? 'Nivel' : 'Level'}</small>
          <strong>{gamification.level}</strong>
          <div className="public-profile-stat-bar">
            <div
              className="public-profile-stat-fill level-fill"
              style={{ width: `${Math.round(gamification.levelProgress * 100)}%` }}
            />
          </div>
        </div>
        <div className="public-profile-stat">
          <small>XP</small>
          <strong>{gamification.xp}</strong>
          <p className="public-profile-stat-hint">
            {gamification.xpInLevel}/{gamification.xpForNextLevel}
          </p>
        </div>
      </motion.div>

      <div className="public-profile-activity-filters">
        <button type="button" className="public-profile-filter-btn active">
          <Star size={14} /> {isEs ? 'Todas' : 'All'}
        </button>
        <button type="button" className="public-profile-filter-btn">
          🚴 {isEs ? 'Ciclismo' : 'Cycling'}
        </button>
        <button type="button" className="public-profile-filter-btn">
          🏃 {isEs ? 'Running' : 'Running'}
        </button>
      </div>

      <motion.section
        className="public-profile-achievements-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="card-header">
          <Trophy size={16} />
          <span>{isEs ? 'Logros' : 'Achievements'}</span>
          <span className="public-profile-badge xs">
            {gamification.unlockedCount}/{gamification.achievements.length}
          </span>
        </div>

        <div className="public-profile-achievements-grid">
          {shownAchievements.map((a) => (
            <div
              key={a.id}
              className={`public-achievement${a.unlocked ? ' unlocked' : ''}`}
            >
              <span className="public-achievement-emoji">
                {a.unlocked ? a.emoji : <Lock size={16} />}
              </span>
              <span className="public-achievement-title">{a.title}</span>
              {!a.unlocked && a.progress > 0 && (
                <span className="public-achievement-progress">
                  <span style={{ width: `${Math.round(a.progress * 100)}%` }} />
                </span>
              )}
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            type="button"
            className="public-profile-show-more"
            onClick={() => setShowAllAchievements(true)}
          >
            {isEs ? 'Ver todos los logros' : 'View all achievements'}
            <ChevronRight size={16} />
          </button>
        )}
      </motion.section>

      <motion.div
        className="public-profile-actions"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button type="button" className="public-profile-action-btn">
          <QrCode size={16} />
          {isEs ? 'Código QR' : 'QR Code'}
        </button>
        <button type="button" className="public-profile-action-btn">
          <Share2 size={16} />
          {isEs ? 'Compartir' : 'Share'}
        </button>
      </motion.div>
    </div>
  )
}
