import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { db } from '../firebase'
import { readCache, writeCache } from '../lib/cache'
import { eventIsExpired, eventStart } from '../lib/dates'
import { friendlyError } from '../lib/errors'
import { coupleMemberIds } from '../lib/members'
import { emailDocId, normalizeEmail, roleLabel } from '../lib/roles'
import type {
  ActivityLog,
  AppNotification,
  AssignedTo,
  Couple,
  CoupleEvent,
  EmailIndex,
  EventTheme,
  Invitation,
  UserProfile,
} from '../types'
import { useAuth } from './AuthContext'

interface NewEventInput {
  title: string
  theme: EventTheme
  emoji: string
  date: string
  hour: string | null
  assignedTo: AssignedTo
}

interface DataState {
  couple: Couple | null
  partner: UserProfile | null
  events: CoupleEvent[]
  logs: ActivityLog[]
  invitationsIn: Invitation[]
  invitationsOut: Invitation[]
  notifications: AppNotification[]
  toasts: string[]
  pendingEventCount: number
  pendingInviteCount: number
  needsPartnerEmail: boolean
  pushToast: (msg: string) => void
  invitePartner: (email: string) => Promise<void>
  cancelInvite: (id: string) => Promise<void>
  acceptInvite: (inv: Invitation) => Promise<void>
  declineInvite: (inv: Invitation) => Promise<void>
  addEvent: (input: NewEventInput) => Promise<void>
  acceptEvent: (ev: CoupleEvent) => Promise<void>
  declineEvent: (ev: CoupleEvent) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  enableAlerts: () => Promise<boolean>
}

const DataContext = createContext<DataState | null>(null)

function asInvite(id: string, data: Record<string, unknown>): Invitation {
  return {
    id,
    fromUid: String(data.fromUid || ''),
    fromRole: data.fromRole === 'gf' ? 'gf' : 'bf',
    fromName: String(data.fromName || ''),
    fromEmail: String(data.fromEmail || ''),
    toEmail: String(data.toEmail || ''),
    toUid: (data.toUid as string | null) ?? null,
    toRole: data.toRole === 'gf' || data.toRole === 'bf' ? data.toRole : null,
    status: (data.status as Invitation['status']) || 'pending',
    coupleId: (data.coupleId as string | null) ?? null,
    createdAt: Number(data.createdAt || 0),
  }
}

function asEvent(id: string, data: Record<string, unknown>): CoupleEvent {
  return {
    id,
    coupleId: String(data.coupleId || ''),
    members: Array.isArray(data.members) ? (data.members as string[]) : [],
    title: String(data.title || ''),
    theme: (data.theme as EventTheme) || 'date',
    emoji: String(data.emoji || '💖'),
    date: String(data.date || ''),
    hour: (data.hour as string | null) ?? null,
    assignedTo: (data.assignedTo as AssignedTo) || 'both',
    status: (data.status as CoupleEvent['status']) || 'pending',
    createdBy: String(data.createdBy || ''),
    createdByRole: data.createdByRole === 'gf' ? 'gf' : 'bf',
    createdByName: String(data.createdByName || ''),
    createdAt: Number(data.createdAt || 0),
    startsAt: Number(data.startsAt || 0),
  }
}

function asLog(id: string, data: Record<string, unknown>): ActivityLog {
  return {
    id,
    coupleId: String(data.coupleId || ''),
    members: Array.isArray(data.members) ? (data.members as string[]) : [],
    actorUid: String(data.actorUid || ''),
    actorName: String(data.actorName || ''),
    actorRole: data.actorRole === 'gf' ? 'gf' : 'bf',
    message: String(data.message || ''),
    type: (data.type as ActivityLog['type']) || 'event_add',
    createdAt: Number(data.createdAt || 0),
  }
}

function asNotif(id: string, data: Record<string, unknown>): AppNotification {
  return {
    id,
    userId: String(data.userId || ''),
    title: String(data.title || ''),
    body: String(data.body || ''),
    type: (data.type as AppNotification['type']) || 'reminder',
    read: Boolean(data.read),
    createdAt: Number(data.createdAt || 0),
  }
}

function asCouple(id: string, data: Record<string, unknown>): Couple {
  const bfUid = String(data.bfUid || '')
  const gfUid = String(data.gfUid || '')
  const listed = Array.isArray(data.members) ? (data.members as string[]) : []
  return {
    id,
    members: coupleMemberIds({ bfUid, gfUid, members: listed }),
    bfUid,
    gfUid,
    bfName: String(data.bfName || 'BF'),
    gfName: String(data.gfName || 'GF'),
    bfEmail: String(data.bfEmail || ''),
    gfEmail: String(data.gfEmail || ''),
    createdAt: Number(data.createdAt || 0),
  }
}

async function notify(userId: string, title: string, body: string, type: AppNotification['type']) {
  if (!userId) return
  await addDoc(collection(db, 'notifications'), {
    userId,
    title,
    body,
    type,
    read: false,
    createdAt: Date.now(),
  })
}

async function liveMembers(couple: Couple) {
  try {
    const snap = await getDoc(doc(db, 'couples', couple.id))
    if (snap.exists()) return coupleMemberIds(asCouple(snap.id, snap.data() as Record<string, unknown>))
  } catch {
    // use local couple
  }
  return coupleMemberIds(couple)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, profile, patchProfile } = useAuth()
  const [couple, setCouple] = useState<Couple | null>(() => readCache('couple', null))
  const [partner, setPartner] = useState<UserProfile | null>(() => readCache('partner', null))
  const [events, setEvents] = useState<CoupleEvent[]>(() => readCache('events', []))
  const [logs, setLogs] = useState<ActivityLog[]>(() => readCache('logs', []))
  const [invitationsIn, setInvitationsIn] = useState<Invitation[]>(() => readCache('invIn', []))
  const [invitationsOut, setInvitationsOut] = useState<Invitation[]>(() => readCache('invOut', []))
  const [notifications, setNotifications] = useState<AppNotification[]>(() => readCache('notifs', []))
  const [toasts, setToasts] = useState<string[]>([])
  const seenNotifs = useRef(new Set<string>())
  const nagTick = useRef(0)
  const cleaned = useRef(new Set<string>())

  const pushToast = useCallback((msg: string) => {
    setToasts((prev) => [...prev.slice(-3), msg])
    window.setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, 4200)
  }, [])

  useEffect(() => {
    if (!user || !profile) return
    const qIn = query(collection(db, 'invitations'), where('toEmail', '==', profile.email))
    const qOut = query(collection(db, 'invitations'), where('fromUid', '==', user.uid))
    const u1 = onSnapshot(
      qIn,
      (snap) => {
        const rows = snap.docs.map((d) => asInvite(d.id, d.data() as Record<string, unknown>))
        setInvitationsIn(rows)
        writeCache('invIn', rows)
      },
      (err) => pushToast(friendlyError(err)),
    )
    const u2 = onSnapshot(
      qOut,
      (snap) => {
        const rows = snap.docs.map((d) => asInvite(d.id, d.data() as Record<string, unknown>))
        setInvitationsOut(rows)
        writeCache('invOut', rows)
      },
      (err) => pushToast(friendlyError(err)),
    )
    return () => {
      u1()
      u2()
    }
  }, [user, profile, pushToast])

  useEffect(() => {
    if (!user || profile?.coupleId) return
    const q = query(collection(db, 'couples'), where('members', 'array-contains', user.uid))
    return onSnapshot(q, (snap) => {
      const found = snap.docs[0]
      if (!found) return
      const next = asCouple(found.id, found.data() as Record<string, unknown>)
      const partnerUid = next.bfUid === user.uid ? next.gfUid : next.bfUid
      const partnerEmail = next.bfUid === user.uid ? next.gfEmail : next.bfEmail
      setCouple(next)
      writeCache('couple', next)
      void patchProfile({ coupleId: next.id, partnerUid, partnerEmail })
    })
  }, [user, profile?.coupleId, patchProfile])

  useEffect(() => {
    if (!user || !profile?.coupleId) return
    const unsub = onSnapshot(
      doc(db, 'couples', profile.coupleId),
      (snap) => {
        if (!snap.exists()) return
        const next = asCouple(snap.id, snap.data() as Record<string, unknown>)
        setCouple(next)
        writeCache('couple', next)
        if (next.members.length >= 2 && (snap.data().members || []).length < 2) {
          void updateDoc(snap.ref, { members: next.members }).catch(() => {})
        }
      },
      (err) => pushToast(friendlyError(err)),
    )
    return unsub
  }, [user, profile?.coupleId, pushToast])

  useEffect(() => {
    if (!profile?.coupleId || !profile.partnerUid) return
    const unsub = onSnapshot(doc(db, 'users', profile.partnerUid), (snap) => {
      if (!snap.exists()) return
      const data = snap.data() as Record<string, unknown>
      const next: UserProfile = {
        uid: snap.id,
        email: String(data.email || ''),
        displayName: String(data.displayName || 'LOVE'),
        photoURL: (data.photoURL as string | null) ?? null,
        role: data.role === 'gf' ? 'gf' : 'bf',
        coupleId: (data.coupleId as string | null) ?? null,
        partnerEmail: (data.partnerEmail as string | null) ?? null,
        partnerUid: (data.partnerUid as string | null) ?? null,
        notificationsEnabled: Boolean(data.notificationsEnabled),
        createdAt: Number(data.createdAt || 0),
      }
      setPartner(next)
      writeCache('partner', next)
    })
    return unsub
  }, [profile?.coupleId, profile?.partnerUid])

  useEffect(() => {
    if (!profile?.coupleId) return
    const qEv = query(collection(db, 'events'), where('coupleId', '==', profile.coupleId))
    const qLog = query(collection(db, 'logs'), where('coupleId', '==', profile.coupleId))
    const u1 = onSnapshot(
      qEv,
      (snap) => {
        const rows = snap.docs
          .map((d) => asEvent(d.id, d.data() as Record<string, unknown>))
          .sort((a, b) => a.startsAt - b.startsAt || a.createdAt - b.createdAt)
        setEvents(rows)
        writeCache('events', rows)
      },
      (err) => pushToast(friendlyError(err)),
    )
    const u2 = onSnapshot(
      qLog,
      (snap) => {
        const rows = snap.docs
          .map((d) => asLog(d.id, d.data() as Record<string, unknown>))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 40)
        setLogs(rows)
        writeCache('logs', rows)
      },
      (err) => pushToast(friendlyError(err)),
    )
    return () => {
      u1()
      u2()
    }
  }, [profile?.coupleId, pushToast])

  useEffect(() => {
    if (!user) return
    const qn = query(collection(db, 'notifications'), where('userId', '==', user.uid))
    const unsub = onSnapshot(qn, (snap) => {
      const rows = snap.docs
        .map((d) => asNotif(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 30)
      setNotifications(rows)
      writeCache('notifs', rows)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!profile) return
    const accepted = invitationsOut.find((i) => i.status === 'accepted' && i.coupleId && !profile.coupleId)
    if (!accepted?.coupleId) return
    void patchProfile({
      coupleId: accepted.coupleId,
      partnerUid: accepted.toUid,
      partnerEmail: accepted.toEmail,
    })
    pushToast('COUPLE BOND LOCKED IN')
  }, [invitationsOut, profile, patchProfile, pushToast])

  useEffect(() => {
    if (!profile || !events.length) return
    const members = (couple?.members ?? [profile.uid]).slice().sort()
    const cleaner = members[0] || profile.uid
    if (profile.uid !== cleaner) return
    const expired = events.filter((ev) => eventIsExpired(ev) && Date.now() - ev.createdAt > 120000).slice(0, 10)
    const todo = expired.filter((ev) => !cleaned.current.has(ev.id))
    if (!todo.length) return
    todo.forEach((ev) => cleaned.current.add(ev.id))
    const t = window.setTimeout(() => {
      void Promise.all(todo.map((ev) => deleteDoc(doc(db, 'events', ev.id)).catch(() => {})))
    }, 2500)
    return () => window.clearTimeout(t)
  }, [events, profile, couple])

  const needsPartnerEmail = Boolean(profile && !profile.coupleId && !profile.partnerEmail)

  useEffect(() => {
    if (!needsPartnerEmail) return
    pushToast('ENTER YOUR LOVE EMAIL TO BOND — THIS IS A COUPLE APP')
    const id = window.setInterval(() => {
      nagTick.current += 1
      pushToast('DONT USE IT ALONE — ENTER BF/GF EMAIL TO BOND')
    }, 50000)
    return () => window.clearInterval(id)
  }, [needsPartnerEmail, pushToast])

  useEffect(() => {
    if (!user || !needsPartnerEmail) return
    const hasNag = notifications.some((n) => n.type === 'nag_partner' && !n.read)
    if (hasNag) return
    const last = Number(sessionStorage.getItem('nag-write') || 0)
    if (Date.now() - last < 6 * 60 * 60 * 1000) return
    sessionStorage.setItem('nag-write', String(Date.now()))
    void notify(
      user.uid,
      'BOND WITH YOUR LOVE',
      'Enter your BF/GF Google email. Calendar Couple is not a solo game.',
      'nag_partner',
    )
  }, [user, needsPartnerEmail, notifications])

  useEffect(() => {
    if (!profile?.notificationsEnabled) return
    const fresh = notifications.filter((n) => !n.read && !seenNotifs.current.has(n.id))
    for (const n of fresh) {
      seenNotifs.current.add(n.id)
      if (Notification.permission === 'granted') {
        try {
          new Notification(n.title, { body: n.body, icon: '/icons/icon-192.png', tag: n.id })
        } catch {
          // ignore
        }
      }
    }
  }, [notifications, profile?.notificationsEnabled])

  useEffect(() => {
    if (!profile?.notificationsEnabled) return
    const timers: number[] = []
    const upcoming = events.filter((ev) => ev.status === 'confirmed' && ev.hour && !eventIsExpired(ev))
    for (const ev of upcoming) {
      const start = eventStart(ev).getTime()
      const fire = (when: number, title: string) => {
        const delay = when - Date.now()
        if (delay <= 0 || delay > 36 * 60 * 60 * 1000) return
        timers.push(
          window.setTimeout(() => {
            if (Notification.permission === 'granted') {
              new Notification(title, {
                body: `${ev.emoji} ${ev.title} · ${ev.hour}`,
                icon: '/icons/icon-192.png',
                tag: `alarm-${ev.id}`,
              })
            }
            navigator.vibrate?.([180, 80, 180, 80, 240])
            pushToast(`REVEIL · ${ev.title}`)
          }, delay),
        )
      }
      fire(start - 10 * 60 * 1000, '10 MIN ALERT')
      fire(start, 'REVEIL · ITS TIME')
    }
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [events, profile?.notificationsEnabled, pushToast])

  const invitePartner = useCallback(
    async (email: string) => {
      if (!user || !profile) throw new Error('Sign in first')
      const toEmail = normalizeEmail(email)
      if (!toEmail || !toEmail.includes('@')) throw new Error('Need a real Google email')
      if (toEmail === profile.email) throw new Error('You cannot bond with yourself')
      const idxSnap = await getDoc(doc(db, 'emailIndex', emailDocId(toEmail)))
      let toUid: string | null = null
      let toRole: EmailIndex['role'] | null = null
      if (idxSnap.exists()) {
        const idx = idxSnap.data() as EmailIndex
        toUid = idx.uid
        toRole = idx.role
        if (toRole === profile.role) throw new Error('Need one BF and one GF')
      }
      const payload = {
        fromUid: user.uid,
        fromRole: profile.role,
        fromName: profile.displayName,
        fromEmail: profile.email,
        toEmail,
        toUid,
        toRole,
        status: 'pending',
        coupleId: null,
        createdAt: Date.now(),
      }
      await addDoc(collection(db, 'invitations'), payload)
      await patchProfile({ partnerEmail: toEmail })
      if (toUid) {
        void notify(
          toUid,
          'COUPLE INVITE',
          `${profile.displayName} (${roleLabel(profile.role)}) wants to bond timelines`,
          'invite',
        )
      }
      pushToast('INVITE SENT · WAITING FOR GREEN CHECK')
    },
    [user, profile, patchProfile, pushToast],
  )

  const cancelInvite = useCallback(
    async (id: string) => {
      await deleteDoc(doc(db, 'invitations', id))
      await patchProfile({ partnerEmail: null })
      pushToast('INVITE CANCELLED')
    },
    [patchProfile, pushToast],
  )

  const acceptInvite = useCallback(
    async (inv: Invitation) => {
      if (!user || !profile) throw new Error('Sign in first')
      if (inv.fromRole === profile.role) throw new Error('Need one BF and one GF')
      const coupleRef = doc(collection(db, 'couples'))
      const bf = profile.role === 'bf'
      const members = [inv.fromUid, user.uid]
      const coupleDoc = {
        members,
        bfUid: bf ? user.uid : inv.fromUid,
        gfUid: bf ? inv.fromUid : user.uid,
        bfName: bf ? profile.displayName : inv.fromName,
        gfName: bf ? inv.fromName : profile.displayName,
        bfEmail: bf ? profile.email : inv.fromEmail,
        gfEmail: bf ? inv.fromEmail : profile.email,
        createdAt: Date.now(),
      }
      const batch = writeBatch(db)
      batch.set(coupleRef, coupleDoc)
      batch.update(doc(db, 'invitations', inv.id), {
        status: 'accepted',
        coupleId: coupleRef.id,
        toUid: user.uid,
        toRole: profile.role,
      })
      batch.set(
        doc(db, 'users', user.uid),
        {
          coupleId: coupleRef.id,
          partnerUid: inv.fromUid,
          partnerEmail: inv.fromEmail,
          updatedAt: Date.now(),
        },
        { merge: true },
      )
      const logRef = doc(collection(db, 'logs'))
      batch.set(logRef, {
        coupleId: coupleRef.id,
        members,
        actorUid: user.uid,
        actorName: profile.displayName,
        actorRole: profile.role,
        message: `${profile.displayName} accepted the couple bond`,
        type: 'bond',
        createdAt: Date.now(),
      })
      await batch.commit()
      setCouple(asCouple(coupleRef.id, coupleDoc as unknown as Record<string, unknown>))
      writeCache('couple', asCouple(coupleRef.id, coupleDoc as unknown as Record<string, unknown>))
      void notify(inv.fromUid, 'BOND ACCEPTED', `${profile.displayName} said YES. Timelines are linked.`, 'bond')
      pushToast('GREEN CHECK · YOU ARE A COUPLE')
    },
    [user, profile, pushToast],
  )

  const declineInvite = useCallback(
    async (inv: Invitation) => {
      if (!user || !profile) return
      await updateDoc(doc(db, 'invitations', inv.id), { status: 'declined', toUid: user.uid, toRole: profile.role })
      void notify(inv.fromUid, 'INVITE DECLINED', `${profile.displayName} hit the red X.`, 'invite')
      pushToast('RED X · INVITE DECLINED')
    },
    [user, profile, pushToast],
  )

  const addEvent = useCallback(
    async (input: NewEventInput) => {
      if (!user || !profile || !couple) throw new Error('Bond first')
      const title = input.title.trim()
      if (!title) throw new Error('NAME THE QUEST')
      const assignedTo = input.assignedTo
      const needsAccept = assignedTo !== profile.role
      const startsAt = eventStart({ date: input.date, hour: input.hour }).getTime()
      if (!Number.isFinite(startsAt)) throw new Error('INVALID DATE')
      const members = await liveMembers(couple)
      if (!members.includes(user.uid)) members.push(user.uid)
      if (members.length < 2) throw new Error('COUPLE BOND INCOMPLETE · REOPEN AND RETRY')
      const eventRef = doc(collection(db, 'events'))
      const eventDoc = {
        coupleId: couple.id,
        members,
        title,
        theme: input.theme,
        emoji: input.emoji,
        date: input.date,
        hour: input.hour || null,
        assignedTo,
        status: needsAccept ? 'pending' : 'confirmed',
        createdBy: user.uid,
        createdByRole: profile.role,
        createdByName: profile.displayName,
        createdAt: Date.now(),
        startsAt,
      }
      const local: CoupleEvent = { id: eventRef.id, ...eventDoc, status: eventDoc.status as CoupleEvent['status'] }
      setEvents((prev) => [...prev.filter((e) => e.id !== local.id), local].sort((a, b) => a.startsAt - b.startsAt))
      writeCache('events', [...events.filter((e) => e.id !== local.id), local])
      try {
        const batch = writeBatch(db)
        batch.set(eventRef, eventDoc)
        batch.set(doc(collection(db, 'logs')), {
          coupleId: couple.id,
          members,
          actorUid: user.uid,
          actorName: profile.displayName,
          actorRole: profile.role,
          message: `${profile.displayName} (${roleLabel(profile.role)}) added "${title}"`,
          type: 'event_add',
          createdAt: Date.now(),
        })
        await batch.commit()
      } catch (err) {
        setEvents((prev) => prev.filter((e) => e.id !== local.id))
        throw new Error(friendlyError(err))
      }
      if (needsAccept && profile.partnerUid) {
        void notify(
          profile.partnerUid,
          'NEW QUEST FOR YOU',
          `${profile.displayName} proposed "${title}". Check or X it.`,
          'event_proposal',
        )
      }
      pushToast(needsAccept ? 'SENT TO PARTNER · WAITING CHECK' : 'QUEST SAVED TO CALENDAR')
    },
    [user, profile, couple, events, pushToast],
  )

  const acceptEvent = useCallback(
    async (ev: CoupleEvent) => {
      if (!user || !profile) throw new Error('Sign in first')
      const members = couple ? await liveMembers(couple) : coupleMemberIds({ bfUid: '', gfUid: '', members: ev.members }, [user.uid, ev.createdBy])
      setEvents((prev) => prev.map((item) => (item.id === ev.id ? { ...item, status: 'confirmed' } : item)))
      try {
        const batch = writeBatch(db)
        batch.update(doc(db, 'events', ev.id), { status: 'confirmed', members })
        batch.set(doc(collection(db, 'logs')), {
          coupleId: ev.coupleId,
          members,
          actorUid: user.uid,
          actorName: profile.displayName,
          actorRole: profile.role,
          message: `${profile.displayName} accepted "${ev.title}"`,
          type: 'event_accept',
          createdAt: Date.now(),
        })
        await batch.commit()
      } catch (err) {
        setEvents((prev) => prev.map((item) => (item.id === ev.id ? { ...item, status: ev.status } : item)))
        throw new Error(friendlyError(err))
      }
      void notify(ev.createdBy, 'QUEST ACCEPTED', `${profile.displayName} checked YES on "${ev.title}"`, 'event_decision')
      pushToast('GREEN CHECK · ADDED TO CALENDAR')
    },
    [user, profile, couple, pushToast],
  )

  const declineEvent = useCallback(
    async (ev: CoupleEvent) => {
      if (!user || !profile) throw new Error('Sign in first')
      setEvents((prev) => prev.filter((item) => item.id !== ev.id))
      try {
        await deleteDoc(doc(db, 'events', ev.id))
        const members = couple ? coupleMemberIds(couple) : ev.members
        await addDoc(collection(db, 'logs'), {
          coupleId: ev.coupleId,
          members,
          actorUid: user.uid,
          actorName: profile.displayName,
          actorRole: profile.role,
          message: `${profile.displayName} declined "${ev.title}"`,
          type: 'event_decline',
          createdAt: Date.now(),
        })
      } catch (err) {
        setEvents((prev) => [...prev, ev])
        throw new Error(friendlyError(err))
      }
      void notify(ev.createdBy, 'QUEST DECLINED', `${profile.displayName} hit the red X on "${ev.title}"`, 'event_decision')
      pushToast('RED X · NOT ADDED')
    },
    [user, profile, couple, pushToast],
  )

  const markNotificationRead = useCallback(async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }, [])

  const enableAlerts = useCallback(async () => {
    if (!('Notification' in window)) {
      pushToast('NOTIFICATIONS NOT SUPPORTED HERE')
      return false
    }
    const perm = await Notification.requestPermission()
    const ok = perm === 'granted'
    await patchProfile({ notificationsEnabled: ok })
    if (ok) {
      new Notification('ALERTS ARMED', {
        body: 'Reveils and push alerts are on for your couple quests.',
        icon: '/icons/icon-192.png',
      })
      pushToast('PUSH + REVEILS ON')
    } else {
      pushToast('PERMISSION DENIED')
    }
    return ok
  }, [patchProfile, pushToast])

  const pendingEventCount = events.filter(
    (ev) =>
      ev.status === 'pending' &&
      ev.createdBy !== profile?.uid &&
      (ev.assignedTo === 'both' || ev.assignedTo === profile?.role),
  ).length
  const pendingInviteCount = invitationsIn.filter((i) => i.status === 'pending').length

  const value = useMemo(
    () => ({
      couple,
      partner,
      events,
      logs,
      invitationsIn,
      invitationsOut,
      notifications,
      toasts,
      pendingEventCount,
      pendingInviteCount,
      needsPartnerEmail,
      pushToast,
      invitePartner,
      cancelInvite,
      acceptInvite,
      declineInvite,
      addEvent,
      acceptEvent,
      declineEvent,
      markNotificationRead,
      enableAlerts,
    }),
    [
      couple,
      partner,
      events,
      logs,
      invitationsIn,
      invitationsOut,
      notifications,
      toasts,
      pendingEventCount,
      pendingInviteCount,
      needsPartnerEmail,
      pushToast,
      invitePartner,
      cancelInvite,
      acceptInvite,
      declineInvite,
      addEvent,
      acceptEvent,
      declineEvent,
      markNotificationRead,
      enableAlerts,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData needs DataProvider')
  return ctx
}
