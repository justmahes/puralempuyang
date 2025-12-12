import { motion } from 'framer-motion';
import { QrCode, Sunrise, Map, Users } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

const experiences = [
  {
    icon: QrCode,
    title: 'Reservasi Sekali Klik',
    desc: 'Kuota realtime, harga transparan, dan pembayaran Midtrans memudahkan Anda memesan tiket dalam satu langkah sederhana.'
  },
  {
    icon: Sunrise,
    title: 'Slot Foto Tanpa Antre',
    desc: 'Pilih waktu terbaik untuk menikmati sunrise di Gate of Heaven. Semua jadwal tertata agar pengalaman tetap nyaman dan khidmat.'
  },
  {
    icon: Map,
    title: 'Panduan Interaktif',
    desc: 'Rute menuju pura, estimasi cuaca, dan info shuttle tersaji dalam itinerary digital yang mudah diikuti.'
  },
  {
    icon: Users,
    title: 'Dukungan Petugas',
    desc: 'Petugas menerima data tiket secara langsung, memastikan validasi dan pengarahan berlangsung lancar di lokasi.'
  },
];

const ExperienceSection = () => {
  const { locale } = useI18n();
  const isEn = locale === 'en';
  const items = [
    {
      icon: QrCode,
      title: isEn ? 'One‑Click Reservation' : 'Reservasi Sekali Klik',
      desc: isEn
        ? 'Real‑time quota, transparent pricing, and Midtrans payments in one simple step.'
        : 'Kuota realtime, harga transparan, dan pembayaran Midtrans memudahkan Anda memesan tiket dalam satu langkah sederhana.',
    },
    {
      icon: Sunrise,
      title: isEn ? 'Photo Slots Without Long Queues' : 'Slot Foto Tanpa Antre',
      desc: isEn
        ? 'Pick the best time for sunrise at the Gate of Heaven. Schedules stay calm and sacred.'
        : 'Pilih waktu terbaik untuk menikmati sunrise di Gate of Heaven. Semua jadwal tertata agar pengalaman tetap nyaman dan khidmat.',
    },
    {
      icon: Map,
      title: isEn ? 'Interactive Guide' : 'Panduan Interaktif',
      desc: isEn
        ? 'Routes, weather estimates, and shuttle info in an easy digital itinerary.'
        : 'Rute menuju pura, estimasi cuaca, dan info shuttle tersaji dalam itinerary digital yang mudah diikuti.',
    },
    {
      icon: Users,
      title: isEn ? 'Staff Support' : 'Dukungan Petugas',
      desc: isEn
        ? 'Operators receive ticket data instantly for smooth validation on-site.'
        : 'Petugas menerima data tiket secara langsung, memastikan validasi dan pengarahan berlangsung lancar di lokasi.',
    },
  ];

  return (
  <section id="experience" className="section-padding scroll-mt-28 bg-cream dark:bg-ebony/90">
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
        {/* Kiri - Teks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-5"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-gold">
            {isEn ? 'Intuitive Journey' : 'Intuitive Journey'}
          </p>

          <h2 className="font-display text-3xl leading-tight text-ebony dark:text-white">
            {isEn
              ? 'Find serenity in every step toward Pura Lempuyang.'
              : 'Temukan ketenangan dalam setiap langkah menuju Pura Lempuyang.'}
          </h2>

          <p className="text-sm text-ebony/70 dark:text-cream/70">
            {isEn
              ? 'Plan your visit, choose a schedule, and enjoy a spiritual experience without long queues.'
              : 'Platform ini membantu Anda merencanakan kunjungan, memilih jadwal, dan menikmati pengalaman spiritual tanpa antrean panjang.'}
          </p>

          <div className="rounded-3xl border border-gold/30 bg-white/70 p-5 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-semibold text-gold italic"
            >
              {isEn
                ? '"Serenity is not only felt at the temple summit; it begins with your very first step in planning the journey."'
                : '"Ketenangan tak hanya dirasakan di puncak pura, tetapi dimulai sejak langkah pertama Anda merencanakan perjalanan."'}
            </motion.p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-ebony/60 dark:text-cream/60">
              Pura Lempuyang Luhur, Karangasem
            </p>
          </div>
        </motion.div>

        {/* Kanan - Fitur (Cards) */}
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-white/40 bg-white/90 backdrop-blur-sm p-5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-3 inline-flex rounded-2xl bg-gold/15 p-3 text-gold">
                <Icon size={18} />
              </div>
              <h3 className="font-semibold text-ebony dark:text-cream">{title}</h3>
              <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

export default ExperienceSection;
