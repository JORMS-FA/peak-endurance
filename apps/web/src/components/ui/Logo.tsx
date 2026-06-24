// Peak Endurance — P + lightning bolt emblem.
// White bold stroke, works on any dark background.
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.3)}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15 12 H65 C85 12 85 55 65 55 H20 V80 L50 80 L30 105 L55 105 L15 135"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
