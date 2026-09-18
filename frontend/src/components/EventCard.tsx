import { Link } from 'react-router-dom'
import { eventStart, formatWhen } from '../lib/dates'
import { roleLabel } from '../lib/roles'
import type { CoupleEvent } from '../types'
import { THEMES } from '../types'
import { Countdown } from './Countdown'
import { PixelEmoji } from './PixelEmoji'

export function EventCard({ event }: { event: CoupleEvent }) {
  const theme = THEMES[event.theme]
  return (
    <article className="event-card" style={{ ['--theme' as string]: theme.color }}>
      <div className="event-card-top">
        <PixelEmoji emoji={event.emoji} size="lg" motion="float" />
        <div>
          <p className="chip">{theme.label}</p>
          <h3>{event.title}</h3>
          <p className="muted">{formatWhen(event)}</p>
        </div>
      </div>
      <Countdown target={eventStart(event).getTime()} />
      <div className="event-card-meta">
        <span className={`who who-${event.assignedTo}`}>{roleLabel(event.assignedTo)}</span>
        <span className="muted">BY {event.createdByName}</span>
        {event.status === 'pending' ? <span className="chip chip-wait">WAITING</span> : null}
      </div>
      <Link className="tiny-link" to="/month">
        OPEN MONTH MAP
      </Link>
    </article>
  )
}
