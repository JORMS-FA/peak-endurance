// Peak Endurance — futuristic mark.
// Dark glass tile, neon gradient angular summit drawn as a single stroke, an
// orbital arc and an AI node at the peak. Reads as "peak + intelligence".
export function Logo({ size = 36, rounded = 11 }: { size?: number; rounded?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="peakStroke" x1="6" y1="40" x2="42" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22c55e" />
          <stop offset="0.5" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="peakTileBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b0f14" />
          <stop offset="1" stopColor="#05070a" />
        </linearGradient>
        <radialGradient id="peakGlow" cx="0.5" cy="0.32" r="0.7">
          <stop stopColor="#2dd4bf" stopOpacity="0.35" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="48" height="48" rx={rounded} fill="url(#peakTileBg)" />
      <rect width="48" height="48" rx={rounded} fill="url(#peakGlow)" />
      <rect x="0.6" y="0.6" width="46.8" height="46.8" rx={rounded - 0.6} stroke="rgba(255,255,255,0.10)" strokeWidth="1.2" />

      {/* Angular summit as one continuous stroke */}
      <path
        d="M7 36 L19 17 L26 27 L31.5 18.5 L41 36"
        stroke="url(#peakStroke)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Faint secondary ridge */}
      <path
        d="M7 36 L41 36"
        stroke="url(#peakStroke)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Orbital arc + AI node at the apex */}
      <path d="M14 13 A 13 13 0 0 1 34 11" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <circle cx="19" cy="17" r="2.6" fill="#eafff6" />
      <circle cx="19" cy="17" r="4.8" stroke="#2dd4bf" strokeWidth="1.1" opacity="0.6" />
    </svg>
  )
}
