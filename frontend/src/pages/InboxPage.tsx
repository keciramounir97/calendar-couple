import { useState } from 'react'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { formatWhen } from '../lib/dates'
import { friendlyError } from '../lib/errors'
import type { CoupleEvent, Invitation } from '../types'

export function InboxPage() {
  const { profile } = useAuth()
  const {
    invitationsIn,
    events,
    acceptInvite,
    declineInvite,
    acceptEvent,
    declineEvent,
    notifications,
    markNotificationRead,
    pushToast,
  } = useData()
  const [busyId, setBusyId] = useState('')

  const pendingInvites = invitationsIn.filter((i) => i.status === 'pending')
  const pendingEvents = events.filter(
    (ev) =>
      ev.status === 'pending' &&
      ev.createdBy !== profile?.uid &&
      (ev.assignedTo === 'both' || ev.assignedTo === profile?.role),
  )

  async function run(id: string, action: () => Promise<void>) {
    if (busyId) return
    setBusyId(id)
    try {
      await action()
    } catch (err) {
      pushToast(friendlyError(err))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="stack">
      <h1>
        <PixelEmoji emoji="📬" size="sm" /> INBOX
      </h1>

      <section>
        <h2>COUPLE INVITES</h2>
        {pendingInvites.length === 0 ? <p className="empty">NO BOND REQUESTS.</p> : null}
        {pendingInvites.map((inv: Invitation) => (
          <article key={inv.id} className="decision-card">
            <PixelEmoji emoji="💘" size="lg" motion="pulse" />
            <div>
              <h3>{inv.fromName} WANTS TO BOND</h3>
              <p className="muted">
                {inv.fromEmail} · {inv.fromRole.toUpperCase()}
              </p>
            </div>
            <div className="decision-row">
              <button
                type="button"
                className="check-btn"
                disabled={busyId === inv.id}
                onClick={() => void run(inv.id, () => acceptInvite(inv))}
                aria-label="Accept"
              >
                ✔
              </button>
              <button
                type="button"
                className="cross-btn"
                disabled={busyId === inv.id}
                onClick={() => void run(inv.id, () => declineInvite(inv))}
                aria-label="Decline"
              >
                ✖
              </button>
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2>QUEST REQUESTS</h2>
        {pendingEvents.length === 0 ? <p className="empty">NO EVENTS WAITING FOR YOU.</p> : null}
        {pendingEvents.map((ev: CoupleEvent) => (
          <article key={ev.id} className="decision-card">
            <PixelEmoji emoji={ev.emoji} size="lg" motion="bounce" />
            <div>
              <h3>{ev.title}</h3>
              <p className="muted">
                {ev.createdByName} proposed · {formatWhen(ev)}
              </p>
            </div>
            <div className="decision-row">
              <button
                type="button"
                className="check-btn"
                disabled={busyId === ev.id}
                onClick={() => void run(ev.id, () => acceptEvent(ev))}
                aria-label="Accept event"
              >
                ✔
              </button>
              <button
                type="button"
                className="cross-btn"
                disabled={busyId === ev.id}
                onClick={() => void run(ev.id, () => declineEvent(ev))}
                aria-label="Decline event"
              >
                ✖
              </button>
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2>ALERTS</h2>
        {notifications.length === 0 ? <p className="empty">QUIET FOR NOW.</p> : null}
        <ul className="log-list">
          {notifications.map((n) => (
            <li key={n.id} className={n.read ? 'dim' : ''}>
              <PixelEmoji emoji={n.read ? '💤' : '🔔'} size="sm" />
              <div>
                <b>{n.title}</b>
                <p>{n.body}</p>
              </div>
              {!n.read ? (
                <PixelButton variant="ghost" onClick={() => void markNotificationRead(n.id)}>
                  OK
                </PixelButton>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
