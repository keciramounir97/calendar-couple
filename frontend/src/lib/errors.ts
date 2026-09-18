export function friendlyError(err: unknown) {
  const e = err as { code?: string; message?: string }
  if (e.code === 'permission-denied') return 'SAVE BLOCKED · REOPEN THE APP AND TRY AGAIN'
  if (e.code === 'unavailable') return 'NETWORK BLIP · TRY AGAIN'
  if (e.code === 'not-found') return 'MISSING DOC · BOND MAY BE INCOMPLETE'
  if (e.message) return e.message
  return 'SAVE FAILED'
}
