import { Link, useNavigate, useParams } from 'react-router-dom'
import { Countdown } from '../components/Countdown'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useData } from '../context/DataContext'
import { eventStart, formatWhen } from '../lib/dates'
import { roleLabel } from '../lib/roles'
import { THEMES } from '../types'

export function EventPage() {
  const { id } = useParams()
  const { events, deleteEvent } = useData()
  const navigate = useNavigate()
  const event = events.find((e) => e.id === id)
  if (!event) {
    return (
      <div className="empty-card">
        <p>That quest is gone.</p>
        <PixelButton onClick={() => navigate('/month')}>Calendar</PixelButton>
      </div>
    )
  }
  const theme = THEMES[event.theme]
  return (
    <div className="stack">
      <article className="event-card" style={{ ['--theme' as string]: theme.color }}>
        <div className="event-card-top">
          <PixelEmoji emoji={event.emoji} size="xl" motion="float" />
          <div>
            <p className="chip">{theme.label}</p>
            <h1>{event.title}</h1>
            <p className="muted">{formatWhen(event)}</p>
          </div>
        </div>
        <Countdown target={eventStart(event).getTime()} />
        <div className="event-card-meta">
          <span className={`who who-${event.assignedTo}`}>{roleLabel(event.assignedTo)}</span>
          <span className="muted">BY {event.createdByName}</span>
          {event.status === 'pending' ? <span className="chip chip-wait">WAITING</span> : null}
        </div>
      </article>
      <div className="row">
        <Link to={`/add?id=${event.id}`} className="pxl-btn pxl-btn-cyan">
          EDIT
        </Link>
        <PixelButton
          variant="red"
          onClick={async () => {
            if (!window.confirm(`Erase "${event.title}"?`)) return
            await deleteEvent(event)
            navigate('/month')
          }}
        >
          ERASE
        </PixelButton>
      </div>
      <PixelButton variant="ghost" onClick={() => navigate('/month')}>
        BACK TO CALENDAR
      </PixelButton>
    </div>
  )
}
