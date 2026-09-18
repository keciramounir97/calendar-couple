import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { BottomNav } from './BottomNav'
import { InstallBanner } from './InstallBanner'
import { NagBanner } from './NagBanner'
import { PixelEmoji } from './PixelEmoji'

export function Layout() {
  const { profile } = useAuth()
  const { couple, toasts, pendingInviteCount, pendingEventCount } = useData()
  const alertCount = pendingInviteCount + pendingEventCount

  return (
    <div className="app-shell">
      <div className="crt" />
      <header className="top-bar">
        <Link to="/" className="brand">
          <PixelEmoji emoji="💘" size="sm" motion="pulse" />
          <span>CPL.CAL</span>
        </Link>
        <div className="couple-chip">
          <b className="bf">{couple?.bfName || (profile?.role === 'bf' ? profile.displayName : 'BF')}</b>
          <PixelEmoji emoji="❤" size="sm" motion="pulse" />
          <b className="gf">{couple?.gfName || (profile?.role === 'gf' ? profile.displayName : 'GF')}</b>
        </div>
        <Link to="/inbox" className="bell" aria-label="Inbox">
          <PixelEmoji emoji="🔔" size="sm" motion="bounce" />
          {alertCount > 0 ? <i>{alertCount}</i> : null}
        </Link>
        <Link to="/settings" className="gear">
          ⚙
        </Link>
      </header>
      <NagBanner />
      <main className="page">
        <Outlet />
      </main>
      <BottomNav />
      <InstallBanner />
      <div className="toasts">
        {toasts.map((t, i) => (
          <div key={`${t}-${i}`} className="toast">
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}
