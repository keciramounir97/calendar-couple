import { Link } from 'react-router-dom'
import { EventCard } from '../components/EventCard'
import { LogList } from '../components/LogList'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { eventIsPast, toISODate } from '../lib/dates'
import { petMood } from '../lib/pet'

export function HomePage() {
  const { profile } = useAuth()
  const { events, logs, couple } = useData()
  const upcoming = events
    .filter((ev) => ev.status !== 'declined' && !eventIsPast(ev))
    .filter((ev) => ev.status === 'confirmed' || ev.createdBy === profile?.uid || ev.assignedTo === profile?.role || ev.assignedTo === 'both')
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(0, 5)
  const today = toISODate(new Date())
  const checked = profile?.role === 'bf' ? couple?.lastCheckInBf === today : couple?.lastCheckInGf === today

  return (
    <div className="home">
      <section className="hero-strip">
        <PixelEmoji emoji="🕹️" size="lg" motion="float" />
        <div>
          <p className="kicker">{profile?.role === 'gf' ? 'GIRLFRIEND' : 'BOYFRIEND'}</p>
          <h1>HEY {profile?.displayName?.toUpperCase()}</h1>
          <p className="muted">
            {couple
              ? `${couple.bfNick || couple.bfName} + ${couple.gfNick || couple.gfName} · streak ${couple.streak || 0}`
              : 'Bond to unlock the shared map'}
          </p>
        </div>
      </section>

      {couple ? (
        <Link to="/pet" className="pet-teaser">
          <img src="/pet-frog.png" alt={couple.pet?.name || 'WIZ FROG'} />
          <div>
            <p className="kicker">{petMood(couple.pet)}</p>
            <h2>{couple.pet?.name || 'WIZ FROG'}</h2>
            <p className="muted">Tap to feed, toilet, or sleep</p>
          </div>
        </Link>
      ) : null}

      <div className="quick-row">
        <Link to="/add" className="quick-btn">
          + QUEST
        </Link>
        <Link to="/love" className="quick-btn">
          💌 LOVE
        </Link>
        <Link to="/month" className="quick-btn">
          📅 CAL
        </Link>
        {couple && !checked ? (
          <Link to="/love" className="quick-btn">
            ✅ IN
          </Link>
        ) : null}
      </div>

      <section>
        <div className="section-head">
          <h2>UP NEXT</h2>
          <Link to="/add">+ ADD</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-card">
            <PixelEmoji emoji="🌙" size="lg" motion="float" />
            <p>Nothing upcoming. Tap + Quest — you can edit or erase it later.</p>
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
          <h2>LOGS</h2>
        </div>
        <LogList logs={logs} />
      </section>
    </div>
  )
}
