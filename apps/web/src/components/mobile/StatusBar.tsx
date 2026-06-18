import { useEffect, useState } from 'react'

type ClockTime = {
  hour: string
  minute: string
}

function format(now: Date): ClockTime {
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return { hour, minute }
}

export function StatusBar() {
  const [time, setTime] = useState<ClockTime>(() => format(new Date()))

  useEffect(() => {
    const tick = () => setTime(format(new Date()))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="status-bar" aria-hidden>
      <span>
        {time.hour}:{time.minute}
      </span>
      <span className="status-bar-dots">
        <i className="on" />
        <i />
        <i />
      </span>
    </div>
  )
}
