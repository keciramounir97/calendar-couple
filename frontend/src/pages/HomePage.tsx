import { Link } from 'react-router-dom'
import { EventCard } from '../components/EventCard'
import { LogList } from '../components/LogList'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { eventIsPast } from '../lib/dates'

export function HomePage() {
  const { profile } = useAuth()
  const { events, logs, couple } = useData()
  const upcoming = events
    .filter((ev) => ev.status !== 'declined' && !eventIsPast(ev))
    .filter((ev) => ev.status === 'confirmed' || ev.createdBy === profile?.uid)
    .sort((a, b) => a.startsAt - b.startsAt)

  return (
    <div className="home">
      <section className="hero-strip">
        <PixelEmoji emoji="🕹️" size="lg" motion="float" />
        <div>
          <p className="kicker">PLAYER {profile?.role === 'gf' ? 'GF' : 'BF'}</p>
          <h1>HEY {profile?.displayName?.toUpperCase()}</h1>
          <p className="muted">{couple ? 'SHARED TIMELINE ONLINE' : 'SOLO MODE LOCKED — BOND TO PLAY'}</p>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>UPCOMING QUESTS</h2>
          <Link to="/add">+ ADD</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-card">
            <PixelEmoji emoji="🌙" size="lg" motion="float" />
            <p>NO LIVE EVENTS. PASSED QUESTS VANISH. ADD THE NEXT ONE.</p>
          </div>
        ) : (
          <div className="card-stack">
            {upcoming.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>LOVE LOGS</h2>
        </div>
        <LogList logs={logs} />
      </section>
    </div>
  )
}
