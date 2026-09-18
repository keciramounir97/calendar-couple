import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MiniChip } from '../components/MiniChip'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
  addMonths,
  isSameDay,
  monthGrid,
  monthLabel,
  showOnCalendar,
  startOfMonth,
  toISODate,
  WEEKDAYS,
} from '../lib/dates'

export function MonthPage() {
  const { profile } = useAuth()
  const { events } = useData()
  const navigate = useNavigate()
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const days = useMemo(() => monthGrid(cursor), [cursor])
  const today = new Date()

  const visible = events.filter((ev) => showOnCalendar(ev, profile?.uid))

  return (
    <div className="cal-page">
      <div className="cal-nav">
        <PixelButton variant="ghost" onClick={() => setCursor((d) => addMonths(d, -1))}>
          ◀
        </PixelButton>
        <h1>
          <PixelEmoji emoji="📅" size="sm" /> {monthLabel(cursor)}
        </h1>
        <PixelButton variant="ghost" onClick={() => setCursor((d) => addMonths(d, 1))}>
          ▶
        </PixelButton>
      </div>
      <p className="muted center">MONTH MAP · TAP A DAY TO DROP A QUEST CARD</p>
      <div className="month-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="dow">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const iso = toISODate(day)
          const inMonth = day.getMonth() === cursor.getMonth()
          const chips = visible.filter((ev) => ev.date === iso)
          return (
            <button
              type="button"
              key={iso}
              className={`day-cell ${inMonth ? '' : 'out'} ${isSameDay(day, today) ? 'today' : ''}`}
              onClick={() => navigate(`/add?date=${iso}`)}
            >
              <span className="num">{day.getDate()}</span>
              <div className="chips">
                {chips.slice(0, 3).map((ev) => (
                  <MiniChip key={ev.id} event={ev} />
                ))}
                {chips.length > 3 ? <span className="more">+{chips.length - 3}</span> : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
