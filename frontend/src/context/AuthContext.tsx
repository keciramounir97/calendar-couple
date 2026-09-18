import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'
import { readCache, writeCache } from '../lib/cache'
import { emailDocId, normalizeEmail } from '../lib/roles'
import type { Role, UserProfile } from '../types'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signInGoogle: () => Promise<void>
  signOut: () => Promise<void>
  completeSetup: (role: Role, displayName: string) => Promise<void>
  patchProfile: (patch: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function toProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: String(data.email || ''),
    displayName: String(data.displayName || 'PLAYER'),
    photoURL: (data.photoURL as string | null) ?? null,
    role: data.role === 'gf' ? 'gf' : 'bf',
    coupleId: (data.coupleId as string | null) ?? null,
    partnerEmail: (data.partnerEmail as string | null) ?? null,
    partnerUid: (data.partnerUid as string | null) ?? null,
    notificationsEnabled: Boolean(data.notificationsEnabled),
    createdAt: Number(data.createdAt || Date.now()),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(() => readCache('profile', null))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void getRedirectResult(auth).catch(() => {})
    const failsafe = window.setTimeout(() => setLoading(false), 3500)
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next)
      if (!next) {
        setProfile(null)
        writeCache('profile', null)
        setLoading(false)
      }
    })
    return () => {
      window.clearTimeout(failsafe)
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    const failsafe = window.setTimeout(() => setLoading(false), 4000)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const next = toProfile(user.uid, snap.data() as Record<string, unknown>)
          setProfile(next)
          writeCache('profile', next)
        } else {
          setProfile(null)
        }
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => {
      window.clearTimeout(failsafe)
      unsub()
    }
  }, [user])

  const signInGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  const completeSetup = useCallback(
    async (role: Role, displayName: string) => {
      if (!user || !user.email) throw new Error('Not signed in')
      const name = displayName.trim() || user.displayName || (role === 'bf' ? 'BF' : 'GF')
      const existing = await getDoc(doc(db, 'users', user.uid))
      const createdAt = existing.exists() ? Number(existing.data().createdAt || Date.now()) : Date.now()
      const payload: UserProfile = {
        uid: user.uid,
        email: normalizeEmail(user.email),
        displayName: name,
        photoURL: user.photoURL || null,
        role,
        coupleId: existing.exists() ? (existing.data().coupleId ?? null) : null,
        partnerEmail: existing.exists() ? (existing.data().partnerEmail ?? null) : null,
        partnerUid: existing.exists() ? (existing.data().partnerUid ?? null) : null,
        notificationsEnabled: existing.exists() ? Boolean(existing.data().notificationsEnabled) : false,
        createdAt,
      }
      await setDoc(doc(db, 'users', user.uid), {
        ...payload,
        updatedAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'emailIndex', emailDocId(payload.email)), {
        uid: user.uid,
        email: payload.email,
        role,
        displayName: name,
      })
    },
    [user],
  )

  const patchProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!user) return
      await setDoc(doc(db, 'users', user.uid), { ...patch, updatedAt: Date.now() }, { merge: true })
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, profile, loading, signInGoogle, signOut, completeSetup, patchProfile }),
    [user, profile, loading, signInGoogle, signOut, completeSetup, patchProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth needs AuthProvider')
  return ctx
}
