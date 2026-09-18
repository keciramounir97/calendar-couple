import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { toISODate } from '../lib/dates'
import { DATE_IDEAS } from '../types'

export function LovePage() {
  const { profile } = useAuth()
  const { couple, notes, wishes, sendNote, addWish, toggleWish, deleteWish, sendLove, checkIn } = useData()
  const [note, setNote] = useState('')
  const [wish, setWish] = useState('')
  const [idea, setIdea] = useState(DATE_IDEAS[0])
  const today = toISODate(new Date())

  if (!couple) {
    return (
      <div className="empty-card">
        <PixelEmoji emoji="💌" size="lg" />
        <p>Bond to unlock notes, kisses, and date ideas.</p>
        <Link to="/bond" className="pxl-btn pxl-btn-pink">
          BOND
        </Link>
      </div>
    )
  }

  const myCheck = profile?.role === 'bf' ? couple.lastCheckInBf : couple.lastCheckInGf
  const days = couple.anniversary
    ? Math.max(0, Math.floor((Date.now() - new Date(couple.anniversary).getTime()) / 86400000))
    : Math.max(0, Math.floor((Date.now() - couple.createdAt) / 86400000))

  return (
    <div className="stack">
      <section className="hero-strip">
        <PixelEmoji emoji="💘" size="lg" motion="pulse" />
        <div>
          <p className="kicker">COUPLE HQ</p>
          <h1>
            {couple.bfNick} + {couple.gfNick}
          </h1>
          <p className="muted">
            {days} days together · streak {couple.streak} · love {couple.loveScore}
          </p>
        </div>
      </section>

      <div className="love-actions">
        <button type="button" className="love-btn" onClick={() => void sendLove('kiss')}>
          💋 KISS {couple.kisses}
        </button>
        <button type="button" className="love-btn" onClick={() => void sendLove('hug')}>
          🤗 HUG {couple.hugs}
        </button>
        <button type="button" className="love-btn" onClick={() => void sendLove('nudge')}>
          👉 NUDGE {couple.nudges}
        </button>
      </div>

      <PixelButton variant={myCheck === today ? 'ghost' : 'gold'} disabled={myCheck === today} onClick={() => void checkIn()}>
        {myCheck === today ? 'CHECKED IN TODAY' : 'DAILY CHECK-IN'}
      </PixelButton>

      <section>
        <h2>DATE SPINNER</h2>
        <article className="event-card">
          <h3>{idea}</h3>
          <PixelButton
            variant="cyan"
            onClick={() => setIdea(DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)])}
          >
            SPIN A DATE
          </PixelButton>
        </article>
      </section>

      <section>
        <h2>LOVE NOTES</h2>
        <form
          className="row-form"
          onSubmit={(e) => {
            e.preventDefault()
            void sendNote(note).then(() => setNote(''))
          }}
        >
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={220} placeholder="A tiny note..." />
          <PixelButton type="submit">SEND</PixelButton>
        </form>
        <ul className="log-list">
          {notes.length === 0 ? <p className="empty">No notes yet.</p> : null}
          {notes.map((n) => (
            <li key={n.id}>
              <PixelEmoji emoji="💌" size="sm" />
              <div>
                <b>{n.fromName}</b>
                <p>{n.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>WISHLIST</h2>
        <form
          className="row-form"
          onSubmit={(e) => {
            e.preventDefault()
            void addWish(wish).then(() => setWish(''))
          }}
        >
          <input value={wish} onChange={(e) => setWish(e.target.value)} maxLength={70} placeholder="Trip, gift, movie..." />
          <PixelButton type="submit" variant="gold">
            ADD
          </PixelButton>
        </form>
        <ul className="wish-list">
          {wishes.map((w) => (
            <li key={w.id} className={w.done ? 'dim' : ''}>
              <button type="button" onClick={() => void toggleWish(w)}>
                {w.done ? '☑' : '☐'} {w.title}
              </button>
              <button type="button" className="tiny-x" onClick={() => void deleteWish(w)}>
                ✖
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
