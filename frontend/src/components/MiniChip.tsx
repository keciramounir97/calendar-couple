import { THEMES, type CoupleEvent } from '../types'

export function MiniChip({ event }: { event: CoupleEvent }) {
  const theme = THEMES[event.theme]
  return (
    <span
      className={`mini-chip ${event.status === 'pending' ? 'mini-wait' : ''}`}
      style={{ background: theme.color }}
      title={event.title}
    >
      {event.emoji} {event.title}
    </span>
  )
}
