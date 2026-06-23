import { motion } from 'framer-motion'

// Animated AI coach mascot: floating head, pulsing aura, blinking eyes and a
// soft scan line. Pure SVG + framer-motion so it stays crisp and lightweight.
export function CoachBot({ size = 92, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <div className="coach-bot" style={{ width: size, height: size }}>
      {/* Aura */}
      <motion.span
        className="coach-bot-aura"
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.15, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="coach-bot-aura coach-bot-aura-2"
        animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      <motion.svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ position: 'relative', zIndex: 1 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="botBody" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10241b" />
            <stop offset="1" stopColor="#0a1512" />
          </linearGradient>
          <linearGradient id="botEye" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#5eead4" />
            <stop offset="1" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Antenna */}
        <line x1="50" y1="16" x2="50" y2="26" stroke="#2dd4bf" strokeWidth="2.4" strokeLinecap="round" />
        <motion.circle
          cx="50" cy="13" r="3.6" fill="#5eead4"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />

        {/* Head */}
        <rect x="22" y="26" width="56" height="46" rx="16" fill="url(#botBody)" stroke="#2dd4bf" strokeWidth="2" />
        {/* Face screen */}
        <rect x="29" y="33" width="42" height="32" rx="11" fill="#04130d" />

        {/* Eyes (blink) */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
          style={{ transformOrigin: '50px 47px' }}
        >
          <circle cx="41" cy="47" r="4.6" fill="url(#botEye)" />
          <circle cx="59" cy="47" r="4.6" fill="url(#botEye)" />
        </motion.g>

        {/* Mouth / thinking dots */}
        {thinking ? (
          <g>
            {[44, 50, 56].map((cx, i) => (
              <motion.circle
                key={cx} cx={cx} cy="58" r="1.8" fill="#5eead4"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </g>
        ) : (
          <path d="M43 57 Q50 61 57 57" stroke="#2dd4bf" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Scan line */}
        <motion.rect
          x="29" width="42" height="2" rx="1" fill="#2dd4bf" opacity="0.35"
          animate={{ y: [34, 63, 34] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ears / side modules */}
        <rect x="17" y="40" width="5" height="14" rx="2.5" fill="#2dd4bf" />
        <rect x="78" y="40" width="5" height="14" rx="2.5" fill="#2dd4bf" />
      </motion.svg>
    </div>
  )
}
