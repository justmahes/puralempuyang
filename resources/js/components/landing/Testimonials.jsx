import { Star } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

// Inisial dipakai sebagai avatar: dua kata pertama yang bukan gelar satu huruf
// (mis. "I Made Surya" -> "MS", bukan "IM").
const getInitials = (name) =>
  name
    .split(' ')
    .filter((part) => part.length > 1)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const Testimonials = () => {
  const { locale } = useI18n();
  const isEn = locale === 'en';

  const testimonials = [
    {
      name: 'Kadek Laksmi',
      role: isEn ? 'Private Guide, Karangasem' : 'Pemandu Wisata Privat, Karangasem',
      quote: isEn
        ? 'Staff greeted me right as the fog rolled in. The sunrise slot was well organized, and QR validation made queues much shorter.'
        : 'Petugas langsung menjemput saya saat kabut mulai turun. Slot sunrise tertata rapi, dan sistem QR membuat antrean jauh lebih singkat.',
      rating: 5,
      accent: { bg: '#d4af37', fg: '#1a1a1a' },
    },
    {
      name: 'Sophie Marchand',
      role: isEn ? 'Traveller from Lyon, France' : 'Wisatawan asal Lyon, Prancis',
      quote: isEn
        ? 'The international rate was stated up front, so there were no surprises at the gate. My QR ticket was scanned in under ten seconds.'
        : 'Tarif wisatawan mancanegara tertera jelas sejak awal, jadi tidak ada kejutan di gerbang. Tiket QR saya dipindai kurang dari sepuluh detik.',
      rating: 5,
      accent: { bg: '#3f6152', fg: '#ffffff' },
    },
    {
      name: 'Putu Aditya',
      role: isEn ? 'On-site Operator' : 'Operator Gerbang',
      quote: isEn
        ? 'The staff panel shows ticket status in real time, so we can manage turns quickly, even on busy weekends.'
        : 'Panel petugas menampilkan status tiket secara realtime, jadi kami bisa mengatur giliran dengan cepat, bahkan saat akhir pekan.',
      rating: 4,
      accent: { bg: '#8c5a3f', fg: '#ffffff' },
    },
    {
      name: 'Nadia Rahmania',
      role: isEn ? 'Travel Planner, Jakarta' : 'Travel Planner, Jakarta',
      quote: isEn
        ? 'Everything, from e-tickets and Midtrans invoices to attire guidance, sits in one dashboard. My clients just arrive and scan.'
        : 'Semua detail, mulai dari tiket elektronik, invoice Midtrans, hingga panduan busana tersimpan di satu dashboard. Klien saya tinggal datang dan memindai QR.',
      rating: 5,
      accent: { bg: '#5b6d8c', fg: '#ffffff' },
    },
    {
      name: 'Michael Turner',
      role: isEn ? 'Traveller from Melbourne, Australia' : 'Wisatawan asal Melbourne, Australia',
      quote: isEn
        ? 'I booked from Australia a week ahead. The dress code and temple etiquette arrived with the ticket, so we turned up prepared.'
        : 'Saya memesan dari Australia seminggu sebelumnya. Panduan busana dan tata krama pura ikut terkirim bersama tiket, jadi kami datang sudah siap.',
      rating: 4,
      accent: { bg: '#7a4a52', fg: '#ffffff' },
    },
    {
      name: 'Clara Widjaja',
      role: isEn ? 'Content Creator, Surabaya' : 'Content Creator, Surabaya',
      quote: isEn
        ? 'Photo sessions at the Gate of Heaven feel efficient. I got a golden hour slot without waiting long.'
        : 'Sistem ini bikin pengalaman foto di Gate of Heaven jadi efisien. Saya dapat jadwal golden hour tanpa perlu menunggu lama di antrean.',
      rating: 5,
      accent: { bg: '#2c2c2c', fg: '#f5f5f4' },
    },
    {
      name: 'Yuki Tanaka',
      role: isEn ? 'Travel Photographer, Osaka' : 'Fotografer Perjalanan, Osaka',
      quote: isEn
        ? 'The location notes and best shooting hours came with the ticket. A real help on my first trip to Karangasem.'
        : 'Panduan lokasi dan jam terbaik untuk memotret dikirim bersama tiket. Sangat membantu untuk perjalanan pertama saya ke Karangasem.',
      rating: 5,
      accent: { bg: '#4a6b7a', fg: '#ffffff' },
    },
    {
      name: 'I Made Surya',
      role: isEn ? 'Villa Manager, Karangasem' : 'Pengelola Villa, Karangasem',
      quote: isEn
        ? 'We can bundle Pura Lempuyang tickets into stay packages. I monitor every order without calling staff one by one.'
        : 'Kami bisa integrasikan tiket Pura Lempuyang ke paket menginap. Semua status pesanan bisa saya pantau langsung tanpa perlu hubungi petugas satu per satu.',
      rating: 4,
      accent: { bg: '#6b5b3f', fg: '#ffffff' },
    },
  ];

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimoni" className="section-padding scroll-mt-28 bg-cream dark:bg-ebony/80">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gold">Testimonials</p>
          <h2 className="mt-2 font-display text-3xl text-ebony dark:text-white">
            {isEn ? 'Stories from Pura Lempuyang' : 'Cerita dari Pura Lempuyang'}
          </h2>
          <p className="mt-3 text-sm text-ebony/70 dark:text-cream/70">
            {isEn
              ? 'Local guides, domestic travellers, and international visitors share how digital reservations make the journey more orderly and meaningful.'
              : 'Pemandu lokal, wisatawan nusantara, dan pengunjung mancanegara berbagi pengalaman mereka tentang sistem reservasi digital yang membuat perjalanan di Pura Lempuyang terasa lebih tertib dan bermakna.'}
          </p>
        </div>

        <div className="testimonial-marquee mt-10 overflow-hidden rounded-[40px] bg-gradient-to-r from-gold/10 via-white to-gold/10 p-1 dark:from-white/5 dark:via-white/10 dark:to-white/5">
          <div className="testimonial-track flex animate-scroll-slow">
            {duplicatedTestimonials.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="testimonial-card m-3 flex min-w-[300px] max-w-[320px] flex-col rounded-[32px] bg-white/90 p-5 text-sm text-ebony shadow-[0_10px_30px_rgba(212,175,55,0.12)] backdrop-blur-md transition hover:-translate-y-1 dark:bg-white/10 dark:text-cream"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold tracking-wide"
                    style={{ backgroundColor: item.accent.bg, color: item.accent.fg }}
                  >
                    {getInitials(item.name)}
                  </span>
                  <div>
                    <p className="font-semibold text-base">{item.name}</p>
                    <p className="text-xs text-ebony/60 dark:text-cream/60">{item.role}</p>
                    <div className="mt-1 flex items-center gap-1 text-gold">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={14}
                          className={starIdx < item.rating ? 'fill-gold text-gold' : 'text-gold/30'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 leading-relaxed text-ebony/80 dark:text-cream/80">{item.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
