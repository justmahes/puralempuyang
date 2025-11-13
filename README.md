# Pura Lempuyang Luhur Ticketing Platform

A single Laravel 12 codebase that bundles the Midtrans-enabled API and the React + Tailwind client in one project (React lives inside `resources/js` and is served via Vite).

## Stack
- **Backend**: Laravel 12, MySQL, JWT auth, Midtrans Snap, Mailables, Excel export
- **Frontend**: React 19, React Router, React Query, TailwindCSS, Framer Motion, html5-qrcode, Recharts
- **Infra add-ons**: Storage-backed QR generator, role-based middleware (user/operator/admin), email templating

## Getting Started
```bash
cp .env.example .env        # isi DB, Midtrans, SMTP, JWT secret
composer install
npm install
php artisan key:generate
php artisan migrate --seed  # membuat tabel + admin & slot awal
php artisan storage:link    # expose storage/app/public
```
Seeder membuat akun admin `admin@puralempuyang.com / password123` dan jadwal contoh. Bila ingin mengisi lewat phpMyAdmin, import `database/mysql_seed.sql` (berisi schema + seed) kemudian update `.env` untuk menyesuaikan kredensial DB.

### Environment Penting
- `DB_*` : koneksi MySQL/ MariaDB Anda
- `JWT_SECRET` : minimal 32 karakter random
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_CALLBACK_TOKEN`
- `MAIL_*` : SMTP (mis. Gmail App Password)
- `FRONTEND_URL` : domain React (biasanya sama dengan `APP_URL`)

Midtrans callback harus mengirim header `X-Callback-Token` yang cocok dengan `.env`. Endpoint: `POST /api/payments/callback`.

## Development
```bash
php artisan serve --port=8000
npm run dev
```
Semua rute non-`/api` otomatis diarahkan ke React SPA. API base path: `http://localhost:8000/api`.

## Production Build
```bash
npm run build   # output -> public/build
php artisan config:cache route:cache view:cache
```
Deploy hasil Laravel seperti biasa (Nginx/Apache). Pastikan `.env` memuat kredensial produksi dan jalankan migrasi di server.

## API Highlights
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Tickets: `GET /api/tickets/slots`, `GET /api/tickets/types`
- Orders: `GET /api/orders`, `POST /api/orders`, `GET /api/orders/show?code=...`
- Payments: `POST /api/payments/token`, `POST /api/payments/callback`
- Admin: overview, export, slot & operator CRUD (`/api/admin/...`)
- Operator: scan & stats (`/api/operator/...`)

## Payment Flow (Midtrans Snap)
1. User pilih slot ? FE hit `POST /api/payments/token`
2. Backend membuat/menyimpan order lalu meminta Snap token
3. FE memanggil `window.snap.pay(token)`
4. Midtrans menembak callback ? backend verifikasi signature + token
5. Order ditandai `paid`, QR tiap tiket dibuat & email `TicketIssued` dikirim
6. Operator scan QR (kamera html5-qrcode atau input manual) ? `POST /api/operator/validate`

## Testing
```bash
php artisan test
```
Feature test otomatis memakai database sementara dan men-seed slot publik sebelum mengakses endpoint.

## Catatan Tambahan
- QR tersimpan di `storage/app/public/qrcodes`; sudah ter-link ke `public/storage`
- Untuk produksi, jalankan queue worker bila ingin mengirim email async
- Update password admin default segera setelah deploy

Om Swastyastu & selamat menikmati platform digital Gate of Heaven ??
