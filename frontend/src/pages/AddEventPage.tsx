import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { toISODate } from '../lib/dates'
import { oppositeRole, roleLabel } from '../lib/roles'
import { EMOJIS, THEMES, type AssignedTo, type EventTheme } from '../types'

export function AddEventPage() {
  const { profile } = useAuth()
  const { couple, addEvent } = useData()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState<EventTheme>('date')
  const [emoji, setEmoji] = useState('💖')
  const [date, setDate] = useState(params.get('date') || toISODate(new Date()))
  const [useHour, setUseHour] = useState(false)
  const [hour, setHour] = useState('19:00')
  const [assignedTo, setAssignedTo] = useState<AssignedTo>('both')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

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
        <p>BOND FIRST. THIS APP WONT SAVE SOLO QUESTS.</p>
        <PixelButton onClick={() => navigate('/bond')}>ENTER PARTNER EMAIL</PixelButton>
      </div>
    )
  }

  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!title.trim()) {
          setErr('NAME THE QUEST')
          return
        }
        setBusy(true)
        setErr('')
        try {
          await addEvent({
            title,
            theme,
            emoji,
            date,
            hour: useHour ? hour : null,
            assignedTo,
          })
          navigate('/')
        } catch (error) {
          setErr((error as Error).message || 'SAVE FAILED')
          setBusy(false)
        }
      }}
    >
      <h1>
        <PixelEmoji emoji="✨" size="sm" /> NEW QUEST
      </h1>
      <label className="field">
        EVENT NAME
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="PIZZA DATE" />
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
      <p className="label">PIXEL EMOJI</p>
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
        SPECIFY HOUR (FOR REVEIL ALARM)
      </label>
      {useHour ? (
        <label className="field">
          HOUR
          <input type="time" value={hour} onChange={(e) => setHour(e.target.value)} />
        </label>
      ) : null}
      <p className="label">WHO IS THIS FOR?</p>
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
      <p className="muted">
        {assignedTo === profile?.role
          ? 'SAVES STRAIGHT TO THE SHARED MAP.'
          : 'PARTNER MUST GREEN-CHECK BEFORE IT LANDS ON THEIR CALENDAR.'}
      </p>
      {err ? <p className="error">{err}</p> : null}
      <PixelButton type="submit" disabled={busy}>
        {busy ? 'SAVING...' : 'CREATE CARD'}
      </PixelButton>
    </form>
  )
}
