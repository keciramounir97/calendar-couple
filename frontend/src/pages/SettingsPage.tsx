import { PixelButton } from '../components/PixelButton'
import { PixelEmoji } from '../components/PixelEmoji'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useState } from 'react'
import type { UiTheme } from '../types'

export function SettingsPage() {
  const { profile, patchProfile, signOut } = useAuth()
  const { couple, enableAlerts, pushToast, updateCouple } = useData()
  const [name, setName] = useState(profile?.displayName || '')
  const [petName, setPetName] = useState(couple?.pet.name || 'WIZ FROG')
  const [anniversary, setAnniversary] = useState(couple?.anniversary || '')
  const [bfNick, setBfNick] = useState(couple?.bfNick || couple?.bfName || '')
  const [gfNick, setGfNick] = useState(couple?.gfNick || couple?.gfName || '')
  const [quietStart, setQuietStart] = useState(profile?.quietStart || '')
  const [quietEnd, setQuietEnd] = useState(profile?.quietEnd || '')

  async function saveProfile() {
    await patchProfile({ displayName: name.trim() || profile?.displayName })
    pushToast('PROFILE SAVED')
  }

  async function saveCouple() {
    if (!couple) return
    await updateCouple({
      pet: { ...couple.pet, name: petName.trim() || 'WIZ FROG' },
      anniversary: anniversary || null,
      bfNick: bfNick.trim() || couple.bfName,
      gfNick: gfNick.trim() || couple.gfName,
    })
  }

  return (
    <div className="stack">
      <h1>
        <PixelEmoji emoji="⚙️" size="sm" /> SETTINGS
      </h1>
      <article className="event-card">
        <p className="chip">{profile?.role === 'gf' ? 'GF ACCOUNT' : 'BF ACCOUNT'}</p>
        <p className="muted">{profile?.email}</p>
        <p className="muted">{couple ? `Bonded · ${couple.bfNick} + ${couple.gfNick}` : 'Not bonded yet'}</p>
      </article>

      <label className="field">
        YOUR NAME
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
      </label>
      <PixelButton variant="ghost" onClick={() => void saveProfile()}>
        SAVE NAME
      </PixelButton>

      <h2>LOOK</h2>
      <div className="who-row">
        {(['pink', 'cyan', 'gold'] as UiTheme[]).map((t) => (
          <button
            type="button"
            key={t}
            className={`who-btn ${profile?.uiTheme === t ? 'on' : ''}`}
            onClick={() => {
              document.documentElement.dataset.theme = t
              void patchProfile({ uiTheme: t })
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <h2>ALERTS</h2>
      <PixelButton variant="cyan" onClick={() => void enableAlerts()}>
        {profile?.notificationsEnabled ? 'ALERTS ON' : 'ENABLE PUSH + REVEILS'}
      </PixelButton>
      <label className="check">
        <input
          type="checkbox"
          checked={profile?.notifyEvents !== false}
          onChange={(e) => void patchProfile({ notifyEvents: e.target.checked })}
        />
        Event alarms
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={profile?.notifyPet !== false}
          onChange={(e) => void patchProfile({ notifyPet: e.target.checked })}
        />
        Pet hungry / toilet / sleep
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={profile?.notifyNotes !== false}
          onChange={(e) => void patchProfile({ notifyNotes: e.target.checked })}
        />
        Notes, kisses, nudges
      </label>
      <div className="row">
        <label className="field">
          QUIET FROM
          <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
        </label>
        <label className="field">
          QUIET TO
          <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
        </label>
      </div>
      <PixelButton
        variant="ghost"
        onClick={() => void patchProfile({ quietStart: quietStart || null, quietEnd: quietEnd || null })}
      >
        SAVE QUIET HOURS
      </PixelButton>

      {couple ? (
        <>
          <h2>COUPLE + PET</h2>
          <label className="field">
            PET NAME
            <input value={petName} onChange={(e) => setPetName(e.target.value)} maxLength={18} />
          </label>
          <label className="field">
            ANNIVERSARY
            <input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
          </label>
          <label className="field">
            BF NICKNAME
            <input value={bfNick} onChange={(e) => setBfNick(e.target.value)} maxLength={16} />
          </label>
          <label className="field">
            GF NICKNAME
            <input value={gfNick} onChange={(e) => setGfNick(e.target.value)} maxLength={16} />
          </label>
          <PixelButton variant="gold" onClick={() => void saveCouple()}>
            SAVE COUPLE SETTINGS
          </PixelButton>
        </>
      ) : null}

      <PixelButton
        variant="gold"
        onClick={() => {
          localStorage.removeItem('hide-install')
          pushToast('Android/desktop: install banner. iPhone: Share → Add to Home Screen')
        }}
      >
        INSTALL APP
      </PixelButton>
      <PixelButton variant="red" onClick={() => void signOut()}>
        SIGN OUT
      </PixelButton>
    </div>
  )
}
