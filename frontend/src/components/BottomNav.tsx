import { NavLink } from 'react-router-dom'

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end>
        HOME
      </NavLink>
      <NavLink to="/month">CAL</NavLink>
      <NavLink to="/pet">PET</NavLink>
      <NavLink to="/love">LOVE</NavLink>
      <NavLink to="/add" className="nav-add">
        +
      </NavLink>
    </nav>
  )
}
