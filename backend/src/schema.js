/** Shared domain contract for Calendar Couple (Spark/free Firebase plan). */

export const ROLES = ['bf', 'gf']

export const EVENT_THEMES = [
  'date',
  'adventure',
  'chill',
  'food',
  'surprise',
  'important',
  'home',
]

export const COLLECTIONS = {
  users: 'users',
  emailIndex: 'emailIndex',
  invitations: 'invitations',
  couples: 'couples',
  events: 'events',
  logs: 'logs',
  notifications: 'notifications',
}

export const FREE_TIER = {
  firestoreReadsPerDay: 50000,
  firestoreWritesPerDay: 20000,
  firestoreDeletesPerDay: 20000,
  hostingTransferMbPerDay: 360,
  notes: [
    'No Cloud Functions on Spark — all live logic runs in Firestore rules + the PWA.',
    'Single-field queries only (no composite indexes) to stay cheap and deploy instantly.',
    'Past events are deleted by one couple member only, in small batches.',
    'In-app nags are local; Firestore notification docs are throttled.',
  ],
}

export function oppositeRole(role) {
  return role === 'bf' ? 'gf' : 'bf'
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function emailDocId(email) {
  return normalizeEmail(email).replace(/\//g, '_')
}

export function assertOppositeRoles(fromRole, toRole) {
  if (!ROLES.includes(fromRole) || !ROLES.includes(toRole)) {
    throw new Error('Pick BF or GF')
  }
  if (fromRole === toRole) {
    throw new Error('A couple bond needs one BF and one GF')
  }
}

export function eventStartMs(date, hour) {
  if (hour) return new Date(`${date}T${hour}:00`).getTime()
  return new Date(`${date}T00:00:00`).getTime()
}

export function eventIsPast(date, hour, now = Date.now()) {
  if (hour) return new Date(`${date}T${hour}:00`).getTime() <= now
  return new Date(`${date}T23:59:59`).getTime() < now
}
