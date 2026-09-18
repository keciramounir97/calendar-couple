import { NavLink } from 'react-router-dom'
import { useData } from '../context/DataContext'

export function BottomNav() {
  const { pendingEventCount, pendingInviteCount } = useData()
  const inbox = pendingEventCount + pendingInviteCount
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end>
        HOME
      </NavLink>
      <NavLink to="/month">MONTH</NavLink>
      <NavLink to="/week">WEEK</NavLink>
      <NavLink to="/add" className="nav-add">
        +
      </NavLink>
      <NavLink to="/inbox">
        INBOX
        {inbox > 0 ? <i>{inbox}</i> : null}
      </NavLink>
    </nav>
  )
}
