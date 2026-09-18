import type { Couple } from '../types'

export function coupleMemberIds(couple: Pick<Couple, 'bfUid' | 'gfUid' | 'members'>, extra: Array<string | null | undefined> = []) {
  return Array.from(
    new Set([couple.bfUid, couple.gfUid, ...(couple.members || []), ...extra].filter((id): id is string => Boolean(id))),
  )
}
