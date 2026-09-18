import {
  COLLECTIONS,
  FREE_TIER,
  ROLES,
  EVENT_THEMES,
  oppositeRole,
  normalizeEmail,
  assertOppositeRoles,
} from './schema.js'

export {
  COLLECTIONS,
  FREE_TIER,
  ROLES,
  EVENT_THEMES,
  oppositeRole,
  normalizeEmail,
  assertOppositeRoles,
}

console.log('Calendar Couple backend (Firebase Spark / free tier)')
console.log('Collections:', Object.values(COLLECTIONS).join(', '))
console.log('Roles:', ROLES.join(', '))
console.log('Themes:', EVENT_THEMES.join(', '))
console.log('Quota notes:')
for (const note of FREE_TIER.notes) console.log(' -', note)
