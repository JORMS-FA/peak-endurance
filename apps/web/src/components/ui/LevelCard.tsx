import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGamification } from '../../hooks/useGamification'
import { CoachOrb } from './CoachOrb'
import type { OrbMood } from './CoachOrb'
import { useI18n } from '../../hooks/useI18n'

export function LevelCard() {
  const { language } = useI18n()
  const isEs = language === 'es'
  const { level, levelTitle, xp, xpInLevel, xpForNextLevel, levelProgress, achievements, unlockedCount } = useGamification()

  const justUnlocked = unlockedCount > 0 && unlockedCount === achievements.filter(a => a.unlocked).length
  const orbMood: OrbMood = justUnlocked && unlockedCount === achievements.length ? 'celebrate' : 'idle'

  return (
    <motion.section
      className="card level-card level-card-orb"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="card-header">
        <Sparkles size={16} />
        <span>{isEs ? 'Tu progreso' : 'Your progress'}</span>
        <span className="level-count">{unlockedCount}/{achievements.length}</span>
      </div>

      <div className="level-orb-row">
        <Link to="/app/perfil" className="level-orb-link" aria-label={isEs ? 'Ver perfil' : 'View profile'}>
          <CoachOrb size={84} mood={orbMood} />
        </Link>
        <div className="level-info">
          <div className="level-rank-row">
            <span className="level-pill">LV {level}</span>
            <strong>{levelTitle}</strong>
          </div>
          <div className="level-bar">
            <motion.div
              className="level-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(levelProgress * 100)}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <small className="text-muted">{xpInLevel} / {xpForNextLevel} XP · {xp} XP</small>
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map((a, i) => (
          <motion.div
            key={a.id}
            className={`achievement${a.unlocked ? ' unlocked' : ''}`}
            title={a.desc}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <span className="achievement-emoji">{a.unlocked ? a.emoji : <Lock size={16} />}</span>
            <span className="achievement-title">{a.title}</span>
            {!a.unlocked && a.progress > 0 && (
              <span className="achievement-progress">
                <span style={{ width: `${Math.round(a.progress * 100)}%` }} />
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <Link to="/app/perfil" className="level-cta">
        {isEs ? 'Ver perfil completo' : 'View full profile'}
      </Link>
    </motion.section>
  )
}
