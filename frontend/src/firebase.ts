import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyC0J-OWvWXoyyCs1TKIA84wPtWpMV5b7X4',
  authDomain: 'calendar-couple.firebaseapp.com',
  projectId: 'calendar-couple',
  storageBucket: 'calendar-couple.firebasestorage.app',
  messagingSenderId: '401772253159',
  appId: '1:401772253159:web:667cbdffc7cf6c2652b742',
  measurementId: 'G-8NZEH7PBQR',
}

export const app = initializeApp(firebaseConfig)

function makeDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  } catch {
    return getFirestore(app)
  }
}

export const db = makeDb()
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

isSupported()
  .then((yes) => {
    if (yes) getAnalytics(app)
  })
  .catch(() => {})
