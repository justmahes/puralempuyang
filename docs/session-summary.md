# Pura Lempuyang — Session Summary (Implementation Log)

This document summarizes our end‑to‑end discussion and changes made, so a new shell can pick up full context quickly.

## Project Overview
- Stack: Laravel 12 (API), React + Vite (SPA), TailwindCSS, Midtrans Snap, JWT, Mailables, Excel export.
- SPA routing via `resources/views/app.blade.php` with `@vite('resources/js/main.jsx')`.
- API routes live in `routes/api.php`; SPA catch‑all in `routes/web.php`.

## Initial Issues and Fixes
- 500 Internal Server Error
  - Root cause: missing Blade cache path `storage/framework/views`.
  - Fix: created `storage/framework/views`.
- `.env` missing
  - Copied `.env.example` to `.env` and set `CACHE_STORE=file` to avoid DB cache errors when DB not ready.
  - Generated `APP_KEY`: `php artisan key:generate`.
  - Cleared caches: config/view/route/cache.
- Favicon crossed icon
  - Added explicit favicon + manifest links in `resources/views/app.blade.php`.
- Service worker + PWA
  - Added `public/sw.js` and `public/manifest.webmanifest`, registered in `resources/js/main.jsx`.

## Advisor Feedback (Offline Mode & Queueing)
- Concern: validation depends on real‑time server; need offline mode plan for mountainous area.
- Proposed & implemented an Offline‑First MVP:
  - PWA + Service Worker to cache shell.
  - IndexedDB (snapshot + pending validations).
  - Snapshot endpoint + batch validation endpoint.
  - Operator UI: offline indicator + manual “Sync”.

## Implemented Features

### 1) Offline Mode (Operator) — MVP
- Backend
  - routes/api.php:
    - `GET /api/operator/snapshot` (new)
    - `POST /api/operator/validate/batch` (new)
  - app/Http/Controllers/Api/OperatorController.php:
    - `snapshot()` returns today’s ticket list for offline cache.
    - `validateBatch()` applies queued validations atomically.
- Frontend
  - PWA registration in `resources/js/main.jsx`.
  - Service worker: `public/sw.js` + `public/manifest.webmanifest`.
  - IndexedDB helpers: `resources/js/services/idb.js` (stores: `snapshotTickets`, `pendingValidations`).
  - Operator Dashboard (`resources/js/pages/OperatorDashboard.jsx`):
    - Offline indicator + “Sinkronkan” button.
    - Fallback to snapshot when offline.
    - Queue validates locally when offline (beep + local block), syncs later.

### 2) Photo Queue (MVP)
- Database (new migration): `database/migrations/2025_12_11_150000_create_photo_queue_tables.php`
  - `photo_points` (points), `photo_queue_entries` (entries), `photo_assets` (uploaded photos).
  - MySQL index length fix: unique constraint uses short name `pq_point_date_num_uq`.
  - Guards for re‑running: `Schema::hasTable()` checks.
- Models
  - `app/Models/PhotoPoint.php`, `PhotoQueueEntry.php`, `PhotoAsset.php`.
- Controller & API
  - `app/Http/Controllers/Api/PhotoQueueController.php`:
    - User: `POST /api/photo-queue/enqueue`, `GET /api/photo-queue/status`.
    - Operator/Admin:
      - `GET /api/photo/points`, `GET /api/photo/queue?point_id&date`
      - `POST /api/photo/queue/call-next` (now accepts `date`), `POST /api/photo/queue/mark-shooting`, `POST /api/photo/queue/complete`, `POST /api/photo/queue/skip`, `POST /api/photo/queue/recall`
      - `POST /api/photo/upload` (multipart, jpg/png ≤ 5 MB)
    - User photos: `GET /api/photo/my-assets` (returns public URLs via `Storage::url`).
    - Auto‑skip no‑show: in `list()`, moves `called` older than `PHOTO_NO_SHOW_MINUTES` (default 3) to `skipped`.
- Operator UI
  - `resources/js/components/operator/PhotoQueuePanel.jsx`:
    - Select point + date filter, Next/Start/Done/Skip, Upload photo(s), Skipped list with Recall.
    - Countdown timer for no‑show (front‑end) matches server default (3 min).
- User UI
  - Dashboard (`resources/js/pages/UserDashboard.jsx`):
    - Inline “Antrean Foto” section: choose point, join queue, and view number/position/status.
    - “Foto Saya” section shows uploaded assets.
    - Payment CTA: if redirected with `?order=PL-...`, shows button to join photo queue.
  - Route `/photo-queue` still exists but no navbar link (queue is inline in dashboard).
- Admin UI
  - Manage photo points section added to `/admin` (`resources/js/pages/AdminDashboard.jsx`).
  - Admin API: `GET/POST/PUT/DELETE /api/admin/photo-points`.

### 3) Seeders & Credentials
- `database/seeders/InitialSeeder.php` now also seeds:
  - Admin: `admin@puralempuyang.com / admin123`
  - Operator: `operator@puralempuyang.com / operator123`
  - Photo point: “Gate of Heaven” (active).

## Fixes & Debugging Notes
- MySQL 64‑char identifier limit
  - Custom index name `pq_point_date_num_uq` used for unique.
- Migration re‑run safety: `Schema::hasTable()` guards to avoid “table exists” errors.
- React errors
  - Duplicate import of `useEffect` removed in `UserDashboard.jsx`.
  - Declaration order fixed (define `orderFromRedirect/recentPaid` before `effectiveOrderCode`).
- Operator “Next” failing
  - Cause: calling “today” while entries were for a different date. Added date filter + pass `date` to call‑next.
- Favicon: added explicit links to avoid broken icon.

## How To Run / Test
- Prepare env
  - Copy `.env.example` → `.env` and set: `CACHE_STORE=file`, DB creds, JWT/Midtrans.
  - `php artisan key:generate`
- Migrate & seed
  - `php artisan migrate`
  - `php artisan db:seed --class=InitialSeeder`
  - `php artisan storage:link`
- Start
  - Backend: `php artisan serve --port=8000`
  - Frontend: `npm install && npm run dev`
- Logins
  - Admin: `admin@puralempuyang.com / admin123`
  - Operator: `operator@puralempuyang.com / operator123`
- Validate features
  - Offline mode: `/operator` → toggle network off, scan; then “Sinkronkan” when online.
  - Photo queue:
    - User: `/dashboard` → Antrean Foto section → Join.
    - Operator: `/operator` → choose point/date → “Waiting” list → “Next/Start/Done/Skip/Recall”, upload photos.
    - User: `/dashboard` → “Foto Saya” shows uploaded photos.

## Config & Env Notes
- `PHOTO_NO_SHOW_MINUTES` (server) controls auto‑skip threshold (default 3). Front‑end timer tuned to 3; can be exposed via config API for dynamic sync.
- To allow editing points via UI, use admin `/admin` → “Titik Foto” section.

## Possible Next Steps
- Signed QR (asymmetric) for offline authenticity.
- ETA estimation for queue + push notifications.
- Layar publik (display Now Serving/Up Next) for TV (SSE/WebSocket).
- Watermark & retention policy for photo assets.
- Edge cache gateway for poor uplink scenarios.

---
Generated by implementation session; last updated after integrating inline photo queue into user dashboard and admin point management.

