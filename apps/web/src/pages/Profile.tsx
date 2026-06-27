import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { useGamification } from '../hooks/useGamification'
import { Trophy, Medal, Star, Lock, ChevronRight, QrCode, Share2, Camera } from 'lucide-react'

export function Profile() {
  const { t, language } = useI18n()
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
        className="profile-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-hero-bg" />

        <div className="profile-hero-content">
          <div className="profile-hero-photo">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="profile-hero-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label={isEs ? 'Cambiar foto' : 'Change photo'}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="profile-hero-photo-img" />
              ) : (
                <div className="profile-hero-photo-placeholder">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="profile-hero-photo-badge">
                <Camera size={16} strokeWidth={2.5} />
              </div>
            </button>
          </div>

          <div className="profile-hero-identity">
            <h1 className="profile-hero-name">{displayName}</h1>
            {location && <p className="profile-hero-location">{location}</p>}
            <div className="profile-hero-badges">
              <span className="profile-badge level-badge">
                <Trophy size={12} /> Lv {gamification.level}
              </span>
              {gamification.unlockedCount === gamification.achievements.length && gamification.achievements.length > 0 && (
                <span className="profile-badge completion-badge">
                  <Medal size={12} /> {isEs ? 'Completo' : 'Complete'}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="profile-stats"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="profile-stat">
          <small>{isEs ? 'Logros' : 'Achievements'}</small>
          <strong>{gamification.unlockedCount}/{gamification.achievements.length}</strong>
          <div className="profile-stat-bar">
            <div
              className="profile-stat-fill achievement-fill"
              style={{
                width: `${gamification.achievements.length ? (gamification.unlockedCount / gamification.achievements.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <div className="profile-stat">
          <small>{isEs ? 'Nivel' : 'Level'}</small>
          <strong>{gamification.level}</strong>
          <div className="profile-stat-bar">
            <div
              className="profile-stat-fill level-fill"
              style={{ width: `${Math.round(gamification.levelProgress * 100)}%` }}
            />
          </div>
        </div>
        <div className="profile-stat">
          <small>XP</small>
          <strong>{gamification.xp}</strong>
          <p className="profile-stat-hint">
            {gamification.xpInLevel}/{gamification.xpForNextLevel}
          </p>
        </div>
      </motion.div>

      <motion.section
        className="card profile-achievements-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="card-header">
          <Trophy size={16} />
          <span>{isEs ? 'Logros' : 'Achievements'}</span>
          <span className="profile-badge xs">
            {gamification.unlockedCount}/{gamification.achievements.length}
          </span>
        </div>

        <div className="achievements-grid">
          {shownAchievements.map((a, i) => (
            <div
              key={a.id}
              className={`achievement${a.unlocked ? ' unlocked' : ''}`}
            >
              <span className="achievement-emoji">
                {a.unlocked ? a.emoji : <Lock size={16} />}
              </span>
              <span className="achievement-title">{a.title}</span>
              {!a.unlocked && a.progress > 0 && (
                <span className="achievement-progress">
                  <span style={{ width: `${Math.round(a.progress * 100)}%` }} />
                </span>
              )}
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            type="button"
            className="profile-show-more"
            onClick={() => setShowAllAchievements(true)}
          >
            {isEs ? 'Ver todos los logros' : 'View all achievements'}
            <ChevronRight size={16} />
          </button>
        )}
      </motion.section>

      <motion.div
        className="profile-actions"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button type="button" className="profile-action-btn">
          <QrCode size={16} />
          {isEs ? 'Código QR' : 'QR Code'}
        </button>
        <button type="button" className="profile-action-btn">
          <Share2 size={16} />
          {isEs ? 'Compartir' : 'Share'}
        </button>
      </motion.div>
    </div>
  )
}
