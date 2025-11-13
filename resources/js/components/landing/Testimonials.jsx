import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Kadek Laksmi',
    role: 'Pemandu Wisata Privat',
    quote:
      'Petugas langsung menjemput saya saat kabut mulai turun. Slot sunrise tertata rapi, dan sistem QR membuat antrean jauh lebih singkat.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=120&q=60',
  },
  {
    name: 'Nadia Rahmania',
    role: 'Travel Planner Jakarta',
    quote:
      'Semua detail, mulai dari tiket elektronik, invoice Midtrans, hingga panduan busana tersimpan di satu dashboard. Klien saya tinggal datang dan memindai QR.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=60',
  },
  {
    name: 'Putu Aditya',
    role: 'Operator Lapangan',
    quote:
      'Panel petugas menampilkan status tiket secara realtime, jadi kami bisa mengatur giliran dengan cepat, bahkan saat akhir pekan.',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1520975918311-3e84da3162ef?auto=format&fit=crop&w=120&q=60',
  },
  {
    name: 'Clara Widjaja',
    role: 'Content Creator',
    quote:
      'Sistem ini bikin pengalaman foto di Gate of Heaven jadi efisien. Saya dapat jadwal golden hour tanpa perlu menunggu lama di antrean.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=60',
  },
  {
    name: 'I Made Surya',
    role: 'Pengelola Villa di Karangasem',
    quote:
      'Kami bisa integrasikan tiket Pura Lempuyang ke paket menginap. Semua status pesanan bisa saya pantau langsung tanpa perlu hubungi petugas satu per satu.',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=60',
  },
];

const duplicatedTestimonials = [...testimonials, ...testimonials];

const Testimonials = () => (
  <section
    id="testimoni"
    className="section-padding scroll-mt-28 bg-cream dark:bg-ebony/80"
  >
    <div className="mx-auto max-w-6xl px-6">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Testimonials</p>
        <h2 className="mt-2 font-display text-3xl text-ebony dark:text-white">
          Cerita nyata dari Pura Lempuyang
        </h2>
        <p className="mt-3 text-sm text-ebony/70 dark:text-cream/70">
          Wisatawan, pemandu, dan operator lokal berbagi pengalaman mereka tentang sistem reservasi
          digital yang membuat perjalanan di Pura Lempuyang terasa lebih tertib dan bermakna.
        </p>
      </div>

      {/* Marquee */}
      <div className="testimonial-marquee mt-10 overflow-hidden rounded-[40px] bg-gradient-to-r from-gold/10 via-white to-gold/10 p-1 dark:from-white/5 dark:via-white/10 dark:to-white/5">
        <div className="testimonial-track flex animate-scroll-slow">
          {duplicatedTestimonials.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="testimonial-card m-3 flex min-w-[300px] max-w-[320px] flex-col rounded-[32px] bg-white/90 p-5 text-sm text-ebony shadow-[0_10px_30px_rgba(212,175,55,0.12)] backdrop-blur-md transition hover:-translate-y-1 dark:bg-white/10 dark:text-cream"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-14 w-14 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-base">{item.name}</p>
                  <p className="text-xs text-ebony/60 dark:text-cream/60">{item.role}</p>
                  <div className="mt-1 flex items-center gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        size={14}
                        className={
                          starIdx < item.rating
                            ? 'fill-gold text-gold'
                            : 'text-gold/30'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 leading-relaxed text-ebony/80 dark:text-cream/80">
                “{item.quote}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Testimonials;
