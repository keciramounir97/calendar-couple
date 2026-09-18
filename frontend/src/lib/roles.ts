export function oppositeRole(role: 'bf' | 'gf') {
  return role === 'bf' ? 'gf' : 'bf'
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function emailDocId(email: string) {
  return normalizeEmail(email).replace(/\//g, '_')
}

export function roleLabel(role: 'bf' | 'gf' | 'both') {
  if (role === 'bf') return 'BF'
  if (role === 'gf') return 'GF'
  return 'BOTH'
}
