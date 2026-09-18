# Calendar Couple backend

This folder is the Firebase backend for the Spark/free plan: **Firestore security rules**, **indexes**, and the **domain schema**. There are no Cloud Functions, because those require the Blaze plan.

## What runs in production

- `firestore.rules` — authorization for users, invitations, couple bonds, events, logs, notifications
- `firestore.indexes.json` — empty on purpose; the PWA uses single-field queries and sorts in memory
- `src/schema.js` — shared couple-app contract (roles, themes, email helpers, free-tier limits)

## Free-tier budget

| Resource | Spark daily limit | How this app stays under it |
| --- | --- | --- |
| Firestore reads | 50,000 | One listener per collection, cache-first UI, IndexedDB persistence |
| Firestore writes | 20,000 | Batched bond/event writes, throttled nags |
| Firestore deletes | 20,000 | Expired events deleted in batches of 10 by one partner only |
| Hosting transfer | 360 MB | Long-cache hashed assets + PWA/Workbox cache |

## Deploy

From the repo root (after `firebase login`):

```bash
npx firebase deploy --only firestore:rules,hosting
```
