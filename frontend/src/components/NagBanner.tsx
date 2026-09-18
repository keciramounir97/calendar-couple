import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { PixelEmoji } from './PixelEmoji'

export function NagBanner() {
  const { profile } = useAuth()
  const { needsPartnerEmail, invitationsOut, couple } = useData()
  if (couple) return null
  const pending = invitationsOut.find((i) => i.status === 'pending')
  if (pending) {
    return (
      <Link to="/bond" className="nag-banner nag-wait">
        <PixelEmoji emoji="💌" size="sm" motion="bounce" />
        WAITING FOR {pending.toEmail} TO HIT GREEN CHECK
      </Link>
    )
  }
  if (!needsPartnerEmail && profile?.partnerEmail) return null
  return (
    <Link to="/bond" className="nag-banner">
      <PixelEmoji emoji="⚠️" size="sm" motion="pulse" />
      ENTER {profile?.role === 'bf' ? 'GF' : 'BF'} EMAIL TO BOND — DONT USE THIS APP ALONE
    </Link>
  )
}
