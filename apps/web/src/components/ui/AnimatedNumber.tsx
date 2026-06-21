import { useEffect, useRef, useState } from 'react'

type Props = {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
}

/**
 * Smoothly animates from the previous value to the new value using
 * requestAnimationFrame. Respects prefers-reduced-motion.
 */
export function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
}: Props) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const startedAtRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDisplay(value)
      return
    }

    fromRef.current = display
    startedAtRef.current = null

    const tick = (t: number) => {
      if (startedAtRef.current == null) startedAtRef.current = t
      const elapsed = t - startedAtRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const next = fromRef.current + (value - fromRef.current) * eased
      setDisplay(next)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toString()

  return <>{prefix}{formatted}{suffix}</>
}
