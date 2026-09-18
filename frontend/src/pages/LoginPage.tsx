import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export function LoginPage() {
  const { signInGoogle } = useAuth()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  return (
    <div className="boot-page">
      <div className="crt" />
      <div className="boot-hero">
        <PixelEmoji emoji="💘" size="xl" motion="pulse" />
        <h1>CALENDAR COUPLE</h1>
        <p className="blink">BF + GF FAST LOGIN</p>
        <p className="muted">NO PASSWORD. GOOGLE ONLY. PIXEL LOVE OS.</p>
      </div>
      <div className="role-preview">
        <div className="role-card bf">
          <PixelEmoji emoji="🩵" size="lg" />
          <b>BF</b>
        </div>
        <PixelEmoji emoji="❤" size="md" motion="pulse" />
        <div className="role-card gf">
          <PixelEmoji emoji="💖" size="lg" />
          <b>GF</b>
        </div>
      </div>
      {err ? <p className="error">{err}</p> : null}
      <PixelButton
        variant="gold"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setErr('')
          try {
            await signInGoogle()
          } catch (e) {
            setErr((e as Error).message || 'LOGIN FAILED')
            setBusy(false)
          }
        }}
      >
        {busy ? 'WARP...' : 'CONTINUE WITH GOOGLE'}
      </PixelButton>
      <p className="fine">Install later as a phone or desktop app. Couple bond required.</p>
    </div>
  )
}
