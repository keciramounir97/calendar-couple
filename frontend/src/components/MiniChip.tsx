import { THEMES, type CoupleEvent } from '../types'

export function MiniChip({ event, onOpen }: { event: CoupleEvent; onOpen?: (id: string) => void }) {
  const theme = THEMES[event.theme]
  return (
    <span
      className={`mini-chip ${event.status === 'pending' ? 'mini-wait' : ''}`}
      style={{ background: theme.color }}
      title={event.title}
      role={onOpen ? 'button' : undefined}
      onClick={(e) => {
        if (!onOpen) return
        e.stopPropagation()
        onOpen(event.id)
      }}
    >
      {event.emoji} {event.title}
    </span>
  )
}
