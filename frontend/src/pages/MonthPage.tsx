import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MiniChip } from '../components/MiniChip'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
  addMonths,
  addWeeks,
  isSameDay,
  monthGrid,
  monthLabel,
  showOnCalendar,
  startOfMonth,
  toISODate,
  weekDays,
  WEEKDAYS,
  weekRangeLabel,
} from '../lib/dates'

export function MonthPage() {
  const { profile } = useAuth()
  const { events } = useData()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'month' | 'week'>('month')
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const days = useMemo(() => (mode === 'month' ? monthGrid(cursor) : weekDays(cursor)), [cursor, mode])
  const today = new Date()
  const visible = events.filter((ev) => showOnCalendar(ev, profile?.uid))

  return (
    <div className="cal-page">
      <div className="cal-nav">
        <PixelButton variant="ghost" onClick={() => setCursor((d) => (mode === 'month' ? addMonths(d, -1) : addWeeks(d, -1)))}>
          ◀
        </PixelButton>
        <h1>
          <PixelEmoji emoji="📅" size="sm" /> {mode === 'month' ? monthLabel(cursor) : weekRangeLabel(cursor)}
        </h1>
        <PixelButton variant="ghost" onClick={() => setCursor((d) => (mode === 'month' ? addMonths(d, 1) : addWeeks(d, 1)))}>
          ▶
        </PixelButton>
      </div>
      <div className="who-row center-row">
        <button type="button" className={`who-btn ${mode === 'month' ? 'on' : ''}`} onClick={() => setMode('month')}>
          MONTH
        </button>
        <button type="button" className={`who-btn ${mode === 'week' ? 'on' : ''}`} onClick={() => setMode('week')}>
          WEEK
        </button>
      </div>
      <p className="muted center">Tap a day to add. Tap a card to edit or erase.</p>
      {mode === 'month' ? (
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
                    <MiniChip key={ev.id} event={ev} onOpen={(id) => navigate(`/event/${id}`)} />
                  ))}
                  {chips.length > 3 ? <span className="more">+{chips.length - 3}</span> : null}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
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
                    <MiniChip key={ev.id} event={ev} onOpen={(eid) => navigate(`/event/${eid}`)} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
