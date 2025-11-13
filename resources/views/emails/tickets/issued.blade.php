@component('mail::message')
# Om Swastyastu {{ $user['name'] }}

Terima kasih telah memesan tiket resmi **Pura Lempuyang Luhur**. Berikut detail kunjungan Anda:

@component('mail::panel')
- Tanggal: **{{ \Carbon\Carbon::parse($order['visit_date'])->translatedFormat('d F Y') }}**
- Waktu: **{{ substr($order['start_time'], 0, 5) }} - {{ substr($order['end_time'], 0, 5) }} WITA**
- Jumlah Pengunjung: **{{ $order['quantity'] }} orang**
@endcomponent

Daftar kode tiket:
@component('mail::table')
| Kode | Status |
| :--- | :----- |
@foreach($tickets as $ticket)
| {{ $ticket['ticket_code'] }} | {{ strtoupper($ticket['status']) }} |
@endforeach
@endcomponent

Mohon tunjukkan QR code terlampir saat tiba di gerbang.

Salam hangat,
**Tim Pura Lempuyang**
@endcomponent
