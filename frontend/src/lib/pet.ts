import type { PetAction, PetState } from '../types'

export function defaultPet(name = 'WIZ FROG'): PetState {
  const now = Date.now()
  return {
    name,
    hunger: 72,
    bladder: 18,
    energy: 80,
    xp: 0,
    sleeping: false,
    sleepingUntil: 0,
    lastDecayAt: now,
    lastActionAt: now,
    lastAction: null,
  }
}

export function petLevel(xp: number) {
  return 1 + Math.floor(xp / 40)
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

export function decayPet(pet: PetState, now = Date.now()): PetState {
  const next = { ...pet }
  if (next.sleeping && next.sleepingUntil && now >= next.sleepingUntil) {
    next.sleeping = false
    next.sleepingUntil = 0
    next.energy = 100
  }
  const hours = Math.max(0, (now - (next.lastDecayAt || now)) / 3600000)
  if (hours <= 0.02) return next
  if (next.sleeping) {
    next.energy = clamp(next.energy + hours * 25)
    next.hunger = clamp(next.hunger - hours * 4)
  } else {
    next.hunger = clamp(next.hunger - hours * 7)
    next.bladder = clamp(next.bladder + hours * 5)
    next.energy = clamp(next.energy - hours * 6)
  }
  next.lastDecayAt = now
  return next
}

export function applyPetAction(pet: PetState, action: PetAction, now = Date.now()): PetState {
  const next = decayPet(pet, now)
  if (action === 'feed') {
    next.hunger = clamp(next.hunger + 38)
    next.bladder = clamp(next.bladder + 16)
    next.energy = clamp(next.energy + 4)
    next.sleeping = false
  } else if (action === 'toilet') {
    next.bladder = 0
    next.energy = clamp(next.energy - 4)
    next.sleeping = false
  } else if (action === 'sleep') {
    next.sleeping = true
    next.sleepingUntil = now + 20 * 60 * 1000
    next.energy = clamp(next.energy + 12)
  } else if (action === 'wake') {
    next.sleeping = false
    next.sleepingUntil = 0
    next.energy = clamp(next.energy + 8)
  } else if (action === 'play') {
    next.energy = clamp(next.energy - 10)
    next.hunger = clamp(next.hunger - 8)
    next.xp += 4
    next.sleeping = false
  }
  next.xp += 6
  next.lastAction = action
  next.lastActionAt = now
  next.lastDecayAt = now
  return next
}

export function petAlerts(pet: PetState) {
  const alerts: { key: string; title: string; body: string }[] = []
  if (pet.hunger <= 32) alerts.push({ key: 'hungry', title: `${pet.name} IS HUNGRY`, body: 'Feed your couple wizard frog before it faints.' })
  if (pet.bladder >= 70) alerts.push({ key: 'toilet', title: `${pet.name} NEEDS THE TOILET`, body: 'Take it to the bathroom or the cape gets messy.' })
  if (!pet.sleeping && pet.energy <= 28) alerts.push({ key: 'sleepy', title: `${pet.name} IS SLEEPY`, body: 'Tuck the frog in for a power nap.' })
  return alerts
}

export function ensurePet(pet?: PetState | null): PetState {
  return decayPet(pet && typeof pet.name === 'string' ? pet : defaultPet())
}

export function petMood(pet?: PetState | null) {
  const p = ensurePet(pet)
  if (p.sleeping) return 'SLEEPING'
  if (p.hunger <= 25) return 'STARVING'
  if (p.bladder >= 80) return 'DANCING'
  if (p.energy <= 20) return 'EXHAUSTED'
  if (p.hunger > 70 && p.energy > 60 && p.bladder < 40) return 'HAPPY'
  return 'OKAY'
}
