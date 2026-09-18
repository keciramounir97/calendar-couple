import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MiniChip } from '../components/MiniChip'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { addWeeks, eventIsPast, isSameDay, toISODate, weekDays, WEEKDAYS, weekRangeLabel } from '../lib/dates'

export function WeekPage() {
  const { profile } = useAuth()
  const { events } = useData()
  const navigate = useNavigate()
  const [cursor, setCursor] = useState(() => new Date())
  const days = useMemo(() => weekDays(cursor), [cursor])
  const today = new Date()
  const visible = events.filter((ev) => ev.status !== 'declined' && !eventIsPast(ev) && (ev.status === 'confirmed' || ev.createdBy === profile?.uid))

  return (
    <div className="cal-page">
      <div className="cal-nav">
        <PixelButton variant="ghost" onClick={() => setCursor((d) => addWeeks(d, -1))}>
          ◀
        </PixelButton>
        <h1>
          <PixelEmoji emoji="🗓️" size="sm" /> {weekRangeLabel(cursor)}
        </h1>
        <PixelButton variant="ghost" onClick={() => setCursor((d) => addWeeks(d, 1))}>
          ▶
        </PixelButton>
      </div>
      <p className="muted center">WEEK SLICE OF THE MONTH MAP</p>
      <div className="week-grid">
        {days.map((day, i) => {
          const iso = toISODate(day)
          const chips = visible.filter((ev) => ev.date === iso)
          return (
            <button
              type="button"
              key={iso}
              className={`week-col ${isSameDay(day, today) ? 'today' : ''}`}
              onClick={() => navigate(`/add?date=${iso}`)}
            >
              <header>
                <span>{WEEKDAYS[i]}</span>
                <b>{day.getDate()}</b>
              </header>
              <div className="week-cards">
                {chips.length === 0 ? <span className="ghost-slot">+</span> : null}
                {chips.map((ev) => (
                  <MiniChip key={ev.id} event={ev} />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
