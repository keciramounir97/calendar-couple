# Calendar Couple

Pixel BF/GF calendar PWA. Google login only, shared monthly/weekly maps, partner event checks, in-app nags until you bond, and Firebase Hosting on the Spark/free plan.

## Stack

- `frontend/` Vite + React + TypeScript PWA
- `backend/` Firestore rules + couple domain schema (no Cloud Functions — those need Blaze)

## Firebase console (one-time)

1. Open [Firebase console](https://console.firebase.google.com/project/calendar-couple)
2. Authentication → Sign-in method → enable **Google**
3. Authentication → Settings → Authorized domains: `localhost`, `calendar-couple.web.app`, `calendar-couple.firebaseapp.com`
4. Firestore Database → Create database (production mode is fine; rules are in `backend/firestore.rules`)

## Local

```bash
cd frontend
npm install
npm run dev
```

## Deploy hosting + rules

```bash
cd frontend
npm run build
cd ..
npx firebase login
npx firebase deploy --only hosting,firestore:rules
```

Live URL after deploy: https://calendar-couple.web.app

## How it plays

1. BF and GF each tap **Continue with Google** and pick their role
2. Enter the partner Google email → they get a green check / red X
3. After a bond, both share one timeline
4. Add a quest for yourself (instant) or for your love (they must accept)
5. Home shows upcoming cards + countdown; past events disappear
6. Enable alerts for reveils; install the PWA on phone or desktop
