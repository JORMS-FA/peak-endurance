// Peak Endurance brand mark: a stylized summit on a gradient tile, with a
// subtle heartbeat/pulse line running through it (endurance + heart rate).
export function Logo({ size = 36, rounded = 12 }: { size?: number; rounded?: number }) {
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
        <linearGradient id="peakTile" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d77f" />
          <stop offset="0.55" stopColor="#16b07a" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
      </defs>

      <rect width="48" height="48" rx={rounded} fill="url(#peakTile)" />

      {/* Mountain peaks */}
      <path
        d="M7 35 L18 16 L24.5 26.5 L29 19 L41 35 Z"
        fill="#ffffff"
      />
      {/* Snow cap / accent on the main peak */}
      <path
        d="M18 16 L21.2 21.5 L18 23 L14.8 21.5 Z"
        fill="#0891b2"
        opacity="0.85"
      />
      {/* Heartbeat / pulse line */}
      <path
        d="M5 31 H13 L15.5 25.5 L19 36 L22.5 22 L25.5 31 H43"
        stroke="#0a2e22"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.22"
      />
    </svg>
  )
}
