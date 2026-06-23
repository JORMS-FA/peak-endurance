import { motion } from 'framer-motion'
import { Trophy, Lock } from 'lucide-react'
import { useGamification } from '../../hooks/useGamification'

export function LevelCard() {
  const { level, levelTitle, xp, xpInLevel, xpForNextLevel, levelProgress, achievements, unlockedCount } = useGamification()

  return (
    <motion.section
      className="card level-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="card-header">
        <Trophy size={16} />
        <span>Nivel y logros</span>
        <span className="level-count">{unlockedCount}/{achievements.length}</span>
      </div>

      <div className="level-top">
        <div className="level-badge">
          <span className="level-num">{level}</span>
        </div>
        <div className="level-info">
          <strong>{levelTitle}</strong>
          <div className="level-bar">
            <motion.div
              className="level-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(levelProgress * 100)}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <small className="text-muted">{xpInLevel} / {xpForNextLevel} XP · {xp} XP totales</small>
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
    </motion.section>
  )
}
