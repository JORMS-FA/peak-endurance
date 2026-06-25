// Peak Endurance — P + lightning bolt monogram
// P: proper vertical stem + curved bowl + visible inner hole
// Bolt: thick stroke zigzag
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#e8e8ec" />
          <stop offset="1" stopColor="#b0b0b8" />
        </linearGradient>
      </defs>
      {/* P letter with evenodd hole */}
      <path
        fillRule="evenodd"
        fill="#ffffff"
        d={
          'M 170 110' +                       // stem top-left
          ' L 360 110' +                       // top bar
          ' C 440 110 440 340 360 340' +       // bowl outer curve
          ' L 210 340' +                       // bottom to stem right
          ' L 170 340' +                       // stem bottom
          ' Z' +                               // stem left edge
          ' M 225 160' +                       // hole top-left
          ' L 315 160' +                       // hole top-right
          ' C 365 160 365 290 315 290' +       // hole inner curve
          ' L 225 290' +                       // hole bottom
          ' Z'                                 // hole left edge
        }
      />
      {/* Lightning bolt as thick stroke zigzag */}
      <path
        d={
          'M 195 340' +                       // start at bottom of P stem
          ' L 270 390' +                       // zag right-down
          ' L 80 490' +                       // zag left-down (sharp tip)
          ' L 165 390'                         // zag back up-right
        }
        stroke="#ffffff"
        strokeWidth={40}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
