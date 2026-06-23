// Premium black-pill store badges with white brand marks (Apple + Google Play).
// Monochrome-on-black is an official badge variant and stays crisp + consistent
// with the Vercel-style dark UI.

function AppleMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

function GooglePlayMark({ size = 20 }: { size?: number }) {
  // Official multicolor Google Play triangle.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.6 2.3c-.3.2-.5.6-.5 1.1v17.2c0 .5.2.9.5 1.1l9.6-9.6L3.6 2.3z" fill="#00D2FF" />
      <path d="M16.8 8.6 5.9 2.3l-.2-.1c-.4-.2-.8-.2-1.1 0l9.6 9.6 2.6-3.2z" fill="#00F076" />
      <path d="M3.2 21.7c.3.2.7.2 1.1 0l.2-.1 10.9-6.3-2.6-3.2-9.6 9.6z" fill="#FF3A44" />
      <path d="M16.8 8.6 14.2 12l2.6 3.4 3.9-2.2c1.1-.6 1.1-1.8 0-2.4l-3.9-2.2z" fill="#FFCE00" />
    </svg>
  )
}

export function StoreBadges({ centered = false }: { centered?: boolean }) {
  return (
    <div className={`store-badges${centered ? ' store-badges-center' : ''}`}>
      <a href="#download" className="store-badge2" aria-label="Google Play">
        <GooglePlayMark />
        <span className="store-badge2-text">
          <small>DISPONIBLE EN</small>
          <strong>Google Play</strong>
        </span>
      </a>
      <a href="#download" className="store-badge2" aria-label="App Store">
        <AppleMark />
        <span className="store-badge2-text">
          <small>Descárgalo en la</small>
          <strong>App Store</strong>
        </span>
      </a>
    </div>
  )
}
