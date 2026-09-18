export type Role = 'bf' | 'gf'
export type EventTheme =
  | 'date'
  | 'adventure'
  | 'chill'
  | 'food'
  | 'surprise'
  | 'important'
  | 'home'
export type EventStatus = 'confirmed' | 'pending' | 'declined'
export type AssignedTo = 'bf' | 'gf' | 'both'
export type InviteStatus = 'pending' | 'accepted' | 'declined'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  role: Role
  coupleId: string | null
  partnerEmail: string | null
  partnerUid: string | null
  notificationsEnabled: boolean
  createdAt: number
}

export interface EmailIndex {
  uid: string
  email: string
  role: Role
  displayName: string
}

export interface Invitation {
  id: string
  fromUid: string
  fromRole: Role
  fromName: string
  fromEmail: string
  toEmail: string
  toUid: string | null
  toRole: Role | null
  status: InviteStatus
  coupleId: string | null
  createdAt: number
}

export interface Couple {
  id: string
  members: string[]
  bfUid: string
  gfUid: string
  bfName: string
  gfName: string
  bfEmail: string
  gfEmail: string
  createdAt: number
}

export interface CoupleEvent {
  id: string
  coupleId: string
  members: string[]
  title: string
  theme: EventTheme
  emoji: string
  date: string
  hour: string | null
  assignedTo: AssignedTo
  status: EventStatus
  createdBy: string
  createdByRole: Role
  createdByName: string
  createdAt: number
  startsAt: number
}

export interface ActivityLog {
  id: string
  coupleId: string
  members: string[]
  actorUid: string
  actorName: string
  actorRole: Role
  message: string
  type: 'event_add' | 'event_accept' | 'event_decline' | 'bond' | 'invite'
  createdAt: number
}

export interface AppNotification {
  id: string
  userId: string
  title: string
  body: string
  type: 'nag_partner' | 'invite' | 'event_proposal' | 'event_decision' | 'reminder' | 'bond'
  read: boolean
  createdAt: number
}

export const THEMES: Record<
  EventTheme,
  { label: string; color: string; emoji: string }
> = {
  date: { label: 'DATE NIGHT', color: '#ff4d9a', emoji: '💖' },
  adventure: { label: 'ADVENTURE', color: '#7dff6a', emoji: '🗺️' },
  chill: { label: 'CHILL', color: '#3de8ff', emoji: '🌙' },
  food: { label: 'FOOD', color: '#ff9f43', emoji: '🍕' },
  surprise: { label: 'SURPRISE', color: '#9b6dff', emoji: '🎁' },
  important: { label: 'IMPORTANT', color: '#ff4d4d', emoji: '⚠️' },
  home: { label: 'HOME', color: '#ffd83d', emoji: '🏠' },
}

export const EMOJIS = ['💖', '😘', '🍕', '🌙', '🎮', '🎁', '🏠', '⭐', '🎵', '☕', '🌸', '🔥', '✈️', '💍', '🧸', '🌈']
