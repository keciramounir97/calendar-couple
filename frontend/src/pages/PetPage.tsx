import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { petLevel, petMood } from '../lib/pet'

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="stat-bar">
      <div className="stat-bar-lab">
        <span>{label}</span>
        <b>{Math.round(value)}</b>
      </div>
      <div className="stat-track">
        <i style={{ width: `${Math.max(4, Math.min(100, value))}%`, background: color }} />
      </div>
    </div>
  )
}

export function PetPage() {
  const { profile } = useAuth()
  const { couple, carePet } = useData()
  const [busy, setBusy] = useState('')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 15000)
    return () => window.clearInterval(id)
  }, [])
  if (!couple) {
    return (
      <div className="empty-card">
        <PixelEmoji emoji="🐸" size="lg" />
        <p>Bond first. The wizard frog lives with the couple.</p>
        <Link to="/bond" className="pxl-btn pxl-btn-gold">
          BOND
        </Link>
      </div>
    )
  }
  const pet = couple.pet
  const mood = petMood(pet)
  async function act(action: 'feed' | 'toilet' | 'sleep' | 'wake' | 'play') {
    setBusy(action)
    try {
      await carePet(action)
    } finally {
      setBusy('')
    }
  }
  return (
    <div className="stack pet-page">
      <div className="pet-room">
        <p className="kicker">
          LV {petLevel(pet.xp)} · {mood}
        </p>
        <h1>{pet.name}</h1>
        <img
          src="/pet-frog.png"
          alt={pet.name}
          className={`pet-sprite ${pet.sleeping ? 'is-sleep' : 'is-idle'} ${pet.hunger < 30 ? 'is-hungry' : ''}`}
          data-tick={tick}
        />
        <p className="muted">
          {pet.sleeping ? 'Zzz in a tiny wizard bed...' : `Cared for by ${couple.bfNick} & ${couple.gfNick}`}
        </p>
      </div>
      <Bar label="BELLY" value={pet.hunger} color="var(--lime)" />
      <Bar label="TOILET" value={pet.bladder} color="var(--gold)" />
      <Bar label="ENERGY" value={pet.energy} color="var(--cyan)" />
      <div className="pet-actions">
        <PixelButton disabled={Boolean(busy) || pet.sleeping} onClick={() => void act('feed')}>
          {busy === 'feed' ? '...' : 'FEED'}
        </PixelButton>
        <PixelButton variant="gold" disabled={Boolean(busy) || pet.sleeping} onClick={() => void act('toilet')}>
          TOILET
        </PixelButton>
        <PixelButton variant="cyan" disabled={Boolean(busy)} onClick={() => void act(pet.sleeping ? 'wake' : 'sleep')}>
          {pet.sleeping ? 'WAKE' : 'SLEEP'}
        </PixelButton>
        <PixelButton variant="lime" disabled={Boolean(busy) || pet.sleeping} onClick={() => void act('play')}>
          PLAY
        </PixelButton>
      </div>
      <p className="muted">
        {profile?.notifyPet
          ? 'Pet alerts are on. Hungry / toilet / sleepy will ping both of you.'
          : 'Turn on pet alerts in Settings so you both get pings.'}
      </p>
    </div>
  )
}
