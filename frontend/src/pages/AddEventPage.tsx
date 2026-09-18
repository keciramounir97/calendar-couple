import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { toISODate } from '../lib/dates'
import { oppositeRole, roleLabel } from '../lib/roles'
import { EMOJIS, THEMES, type AssignedTo, type EventTheme } from '../types'

export function AddEventPage() {
  const { id: routeId } = useParams()
  const { profile } = useAuth()
  const { couple, events, addEvent, updateEvent, deleteEvent } = useData()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const id = routeId || params.get('id') || undefined
  const existing = events.find((e) => e.id === id)
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState<EventTheme>('date')
  const [emoji, setEmoji] = useState('💖')
  const [date, setDate] = useState(params.get('date') || toISODate(new Date()))
  const [useHour, setUseHour] = useState(false)
  const [hour, setHour] = useState('19:00')
  const [assignedTo, setAssignedTo] = useState<AssignedTo>('both')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!existing) return
    setTitle(existing.title)
    setTheme(existing.theme)
    setEmoji(existing.emoji)
    setDate(existing.date)
    setUseHour(Boolean(existing.hour))
    setHour(existing.hour || '19:00')
    setAssignedTo(existing.assignedTo)
  }, [existing])

  const whoOptions = useMemo(() => {
    if (!profile) return []
    const mine = profile.role
    const theirs = oppositeRole(mine)
    const options: { id: AssignedTo; label: string }[] = [
      { id: mine, label: `FOR ME (${roleLabel(mine)})` },
      { id: theirs, label: `FOR ${roleLabel(theirs)}` },
      { id: 'both', label: 'FOR BOTH' },
    ]
    return options
  }, [profile])

  if (!couple) {
    return (
      <div className="empty-card">
        <PixelEmoji emoji="🔒" size="lg" />
        <p>Bond first to save couple quests.</p>
        <PixelButton onClick={() => navigate('/bond')}>Enter partner email</PixelButton>
      </div>
    )
  }

  if (id && !existing) {
    return (
      <div className="empty-card">
        <p>Quest not found.</p>
        <PixelButton onClick={() => navigate('/month')}>Back to calendar</PixelButton>
      </div>
    )
  }

  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!title.trim()) {
          setErr('Name the quest')
          return
        }
        setBusy(true)
        setErr('')
        try {
          const payload = { title, theme, emoji, date, hour: useHour ? hour : null, assignedTo }
          if (id) await updateEvent(id, payload)
          else await addEvent(payload)
          navigate(id ? `/event/${id}` : '/month')
        } catch (error) {
          setErr((error as Error).message || 'SAVE FAILED')
          setBusy(false)
        }
      }}
    >
      <h1>
        <PixelEmoji emoji="✨" size="sm" /> {id ? 'EDIT QUEST' : 'NEW QUEST'}
      </h1>
      <p className="muted">{id ? 'Change it, then save. Or erase it forever.' : 'Tap a day on the calendar, or fill this in.'}</p>
      <label className="field">
        EVENT NAME
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="Pizza date" />
      </label>
      <p className="label">THEME</p>
      <div className="theme-row">
        {(Object.keys(THEMES) as EventTheme[]).map((key) => (
          <button
            type="button"
            key={key}
            className={`theme-pill ${theme === key ? 'on' : ''}`}
            style={{ ['--theme' as string]: THEMES[key].color }}
            onClick={() => {
              setTheme(key)
              setEmoji(THEMES[key].emoji)
            }}
          >
            {THEMES[key].emoji} {THEMES[key].label}
          </button>
        ))}
      </div>
      <p className="label">EMOJI</p>
      <div className="emoji-row">
        {EMOJIS.map((em) => (
          <button type="button" key={em} className={`emoji-pick ${emoji === em ? 'on' : ''}`} onClick={() => setEmoji(em)}>
            <PixelEmoji emoji={em} size="md" motion={emoji === em ? 'bounce' : 'float'} />
          </button>
        ))}
      </div>
      <label className="field">
        DATE
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label className="check">
        <input type="checkbox" checked={useHour} onChange={(e) => setUseHour(e.target.checked)} />
        Set an hour (alarm)
      </label>
      {useHour ? (
        <label className="field">
          HOUR
          <input type="time" value={hour} onChange={(e) => setHour(e.target.value)} />
        </label>
      ) : null}
      <p className="label">WHO?</p>
      <div className="who-row">
        {whoOptions.map((opt) => (
          <button
            type="button"
            key={opt.id}
            className={`who-btn ${assignedTo === opt.id ? 'on' : ''}`}
            onClick={() => setAssignedTo(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {err ? <p className="error">{err}</p> : null}
      <PixelButton type="submit" disabled={busy}>
        {busy ? 'SAVING...' : id ? 'SAVE CHANGES' : 'CREATE CARD'}
      </PixelButton>
      {existing ? (
        <PixelButton
          variant="red"
          disabled={busy}
          onClick={async () => {
            if (!window.confirm(`Erase "${existing.title}"?`)) return
            setBusy(true)
            try {
              await deleteEvent(existing)
              navigate('/month')
            } catch (error) {
              setErr((error as Error).message)
              setBusy(false)
            }
          }}
        >
          ERASE QUEST
        </PixelButton>
      ) : null}
    </form>
  )
}
