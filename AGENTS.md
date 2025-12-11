# Agent Notes for This Repository

Welcome! If you're a new agent instance working in this repo, please read the following before making changes.

- Start by reading `docs/session-summary.md` for full context of what has been implemented so far (offline mode, photo queue, admin tools, known fixes, and how to run/test).
- This is a Laravel + React (Vite) monorepo. API endpoints live in `routes/api.php`. SPA entry is in `resources/views/app.blade.php` and `resources/js/`.
- Offline Mode (Operator) is already implemented (PWA, service worker, IndexedDB, snapshot + batch endpoints). Do not remove these unless explicitly requested.
- Photo Queue MVP is implemented with DB tables (`photo_points`, `photo_queue_entries`, `photo_assets`), backend APIs, an operator panel, a user dashboard section, and admin management.
- Admin default credentials: `admin@puralempuyang.com / admin123`. Operator: `operator@puralempuyang.com / operator123` (from `InitialSeeder`).
- Useful scripts:
  - Migrate + seed: `php artisan migrate` and `php artisan db:seed --class=InitialSeeder`
  - Storage link: `php artisan storage:link`
  - Dev servers: `php artisan serve --port=8000` and `npm run dev`

If you need a quick overview of endpoints or UI, see `docs/session-summary.md`.
