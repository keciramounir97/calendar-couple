import { useState } from 'react'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export function SetupPage() {
  const { user, completeSetup } = useAuth()
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState(user?.displayName || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  return (
    <div className="boot-page">
      <div className="crt" />
      <h1>CHOOSE YOUR PLAYER</h1>
      <p className="muted">ONE BF. ONE GF. THEN YOU BOND.</p>
      <div className="role-pick">
        <button type="button" className={`role-card bf ${role === 'bf' ? 'on' : ''}`} onClick={() => setRole('bf')}>
          <PixelEmoji emoji="🩵" size="xl" motion="bounce" />
          <b>BOYFRIEND</b>
          <span>CYAN QUEST LINE</span>
        </button>
        <button type="button" className={`role-card gf ${role === 'gf' ? 'on' : ''}`} onClick={() => setRole('gf')}>
          <PixelEmoji emoji="💖" size="xl" motion="bounce" />
          <b>GIRLFRIEND</b>
          <span>PINK QUEST LINE</span>
        </button>
      </div>
      <label className="field">
        DISPLAY NAME
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="PIXEL NAME" />
      </label>
      {err ? <p className="error">{err}</p> : null}
      <PixelButton
        disabled={!role || busy}
        onClick={async () => {
          if (!role) return
          setBusy(true)
          setErr('')
          try {
            await completeSetup(role, name)
          } catch (e) {
            setErr((e as Error).message || 'SETUP FAILED')
            setBusy(false)
          }
        }}
      >
        {busy ? 'SAVING...' : 'ENTER THE CALENDAR'}
      </PixelButton>
    </div>
  )
}
