import { useEffect, useState } from 'react'
import { countdownParts } from '../lib/dates'

export function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const p = countdownParts(target, now)
  const cell = (n: number, label: string) => (
    <div className="count-cell">
      <b>{String(n).padStart(2, '0')}</b>
      <span>{label}</span>
    </div>
  )
  return (
    <div className="countdown">
      {cell(p.days, 'DD')}
      {cell(p.hours, 'HH')}
      {cell(p.minutes, 'MM')}
      {cell(p.seconds, 'SS')}
    </div>
  )
}
