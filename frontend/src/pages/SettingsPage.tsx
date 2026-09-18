import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export function SettingsPage() {
  const { profile, signOut } = useAuth()
  const { couple, enableAlerts, pushToast } = useData()

  return (
    <div className="stack">
      <h1>
        <PixelEmoji emoji="⚙️" size="sm" /> SETTINGS
      </h1>
      <article className="event-card">
        <p className="chip">{profile?.role === 'gf' ? 'GF ACCOUNT' : 'BF ACCOUNT'}</p>
        <h3>{profile?.displayName}</h3>
        <p className="muted">{profile?.email}</p>
        <p className="muted">{couple ? `BONDED · ${couple.bfName} + ${couple.gfName}` : 'NOT BONDED YET'}</p>
      </article>
      <PixelButton variant="cyan" onClick={() => void enableAlerts()}>
        {profile?.notificationsEnabled ? 'ALERTS ARMED' : 'ENABLE PUSH + REVEILS'}
      </PixelButton>
      <p className="muted">
        Allow notifications, then keep the installed app handy. Timed quests fire a reveil 10 minutes before and at the hour.
      </p>
      <PixelButton
        variant="gold"
        onClick={() => {
          localStorage.removeItem('hide-install')
          pushToast('ANDROID/DESKTOP: USE INSTALL BANNER. IPHONE: SHARE → ADD TO HOME SCREEN')
        }}
      >
        INSTALL APP HINT
      </PixelButton>
      <p className="muted">On Android/desktop use the install banner. On iPhone: Share → Add to Home Screen.</p>
      <PixelButton variant="red" onClick={() => void signOut()}>
        SIGN OUT
      </PixelButton>
    </div>
  )
}
