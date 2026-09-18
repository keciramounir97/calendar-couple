import { useState } from 'react'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export function BondPage() {
  const { profile } = useAuth()
  const { couple, invitationsOut, invitePartner, cancelInvite } = useData()
  const [email, setEmail] = useState(profile?.partnerEmail || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const pending = invitationsOut.find((i) => i.status === 'pending')
  const target = profile?.role === 'bf' ? 'GF' : 'BF'

  if (couple) {
    return (
      <div className="empty-card">
        <PixelEmoji emoji="💍" size="xl" motion="pulse" />
        <h1>BOND COMPLETE</h1>
        <p>
          {couple.bfName} + {couple.gfName}
        </p>
        <p className="muted">SHARED TIMELINE IS LIVE.</p>
      </div>
    )
  }

  return (
    <div className="stack">
      <h1>
        <PixelEmoji emoji="🔗" size="sm" /> COUPLE BOND
      </h1>
      <p className="muted">
        ENTER THE GOOGLE EMAIL OF YOUR {target}. THEY GET A GREEN CHECK / RED X. THIS APP NAGS FOREVER IF YOU STAY SOLO.
      </p>
      {pending ? (
        <article className="decision-card">
          <PixelEmoji emoji="💌" size="lg" motion="bounce" />
          <div>
            <h3>WAITING ON {pending.toEmail}</h3>
            <p className="muted">WHEN THEY LOGIN THEY CAN CHECK GREEN OR X RED.</p>
          </div>
          <PixelButton variant="red" onClick={() => void cancelInvite(pending.id)}>
            CANCEL
          </PixelButton>
        </article>
      ) : (
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setErr('')
            try {
              await invitePartner(email)
            } catch (error) {
              setErr((error as Error).message || 'INVITE FAILED')
            } finally {
              setBusy(false)
            }
          }}
        >
          <label className="field">
            {target} GOOGLE EMAIL
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${target.toLowerCase()}@gmail.com`}
              required
            />
          </label>
          {err ? <p className="error">{err}</p> : null}
          <PixelButton type="submit" disabled={busy}>
            {busy ? 'SENDING...' : `SEND BOND TO ${target}`}
          </PixelButton>
        </form>
      )}
    </div>
  )
}
