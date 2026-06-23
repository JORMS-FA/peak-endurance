import { motion } from 'framer-motion'

export type OrbMood = 'idle' | 'thinking' | 'happy' | 'tired' | 'celebrate'

type MoodConfig = {
  rotDur: number
  rotDurInner: number
  breatheDur: number
  breatheScale: number[]
  auraOpacity: number
  glow: number
  yBob: number[]
}

const MOODS: Record<OrbMood, MoodConfig> = {
  idle:       { rotDur: 22, rotDurInner: 14, breatheDur: 5.0, breatheScale: [1, 1.04, 1], auraOpacity: 0.5,  glow: 0.7,  yBob: [0, -4, 0] },
  thinking:   { rotDur: 7,  rotDurInner: 4,  breatheDur: 1.9, breatheScale: [1, 1.07, 1], auraOpacity: 0.8,  glow: 1.0,  yBob: [0, -2, 0] },
  happy:      { rotDur: 9,  rotDurInner: 5,  breatheDur: 2.3, breatheScale: [1, 1.11, 1], auraOpacity: 0.85, glow: 1.15, yBob: [0, -8, 0] },
  tired:      { rotDur: 34, rotDurInner: 22, breatheDur: 6.5, breatheScale: [1, 1.02, 1], auraOpacity: 0.28, glow: 0.4,  yBob: [0, -1, 0] },
  celebrate:  { rotDur: 4,  rotDurInner: 2.5,breatheDur: 1.3, breatheScale: [1, 1.15, 1], auraOpacity: 1.0,  glow: 1.3,  yBob: [0, -12, 0] },
}

const RGB_CONIC = 'conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)'
const RGB_CONIC_2 = 'conic-gradient(from 180deg, #ec4899, #8b5cf6, #3b82f6, #06b6d4, #22c55e, #eab308, #f59e0b, #ef4444, #ec4899)'

export function CoachOrb({
  size = 120,
  mood = 'idle',
  thinking = false,
  className = '',
}: {
  size?: number
  mood?: OrbMood
  thinking?: boolean
  className?: string
}) {
  const active: OrbMood = thinking ? 'thinking' : mood
  const cfg = MOODS[active]
  const core = Math.round(size * 0.58)
  const auraSize = Math.round(size * 1.0)

  return (
    <div
      className={`coach-orb ${className}`.trim()}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Peak coach orb"
    >
      <motion.div
        className="coach-orb-wrap"
        animate={{ y: cfg.yBob, scale: cfg.breatheScale }}
        transition={{ duration: cfg.breatheDur, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer RGB aura — large, very blurred, slow rotation */}
        <motion.div
          className="coach-orb-aura coach-orb-aura-outer"
          style={{
            width: auraSize, height: auraSize,
            background: RGB_CONIC,
            opacity: cfg.auraOpacity,
            filter: `blur(${Math.round(size * 0.32)}px)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: cfg.rotDur, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner RGB aura — counter-rotation, tighter */}
        <motion.div
          className="coach-orb-aura coach-orb-aura-inner"
          style={{
            width: Math.round(size * 0.82), height: Math.round(size * 0.82),
            background: RGB_CONIC_2,
            opacity: cfg.auraOpacity * 0.9,
            filter: `blur(${Math.round(size * 0.18)}px)`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: cfg.rotDurInner, repeat: Infinity, ease: 'linear' }}
        />

        {/* Crystal core — dark glass sphere with subtle RGB rim */}
        <div
          className="coach-orb-core"
          style={{
            width: core, height: core,
            boxShadow: `0 0 ${Math.round(size * 0.22)} ${Math.round(size * 0.04)} rgba(120,180,255,${0.18 * cfg.glow}), inset 0 0 ${Math.round(size * 0.12)} rgba(0,0,0,0.9)`,
          }}
        >
          {/* Inner swirling light — faint RGB that seeps into the glass */}
          <motion.div
            className="coach-orb-core-swirl"
            style={{ background: RGB_CONIC, filter: `blur(${Math.round(size * 0.1)}px)` }}
            animate={{ rotate: 360, scale: [1, 1.08, 1] }}
            transition={{ rotate: { duration: cfg.rotDurInner * 1.4, repeat: Infinity, ease: 'linear' }, scale: { duration: cfg.breatheDur, repeat: Infinity, ease: 'easeInOut' } }}
          />

          {/* Specular highlight — white glass reflection top-left */}
          <div
            className="coach-orb-spec"
            style={{ width: Math.round(core * 0.42), height: Math.round(core * 0.42) }}
          />

          {/* Pupil / inner glow that reacts to mood */}
          <motion.div
            className="coach-orb-pupil"
            animate={{ opacity: [0.5 * cfg.glow, 0.85 * cfg.glow, 0.5 * cfg.glow], scale: [1, 1.1, 1] }}
            transition={{ duration: cfg.breatheDur, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: Math.round(core * 0.18), height: Math.round(core * 0.18) }}
          />
        </div>
      </motion.div>

      {/* Celebrate burst particles */}
      {active === 'celebrate' && (
        <div className="coach-orb-burst" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i / 8) * Math.PI * 2
            const dx = Math.cos(angle) * size * 0.6
            const dy = Math.sin(angle) * size * 0.6
            const colors = ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308']
            return (
              <motion.span
                key={i}
                className="coach-orb-spark"
                style={{ background: colors[i] }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x: dx, y: dy, opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.05 }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
