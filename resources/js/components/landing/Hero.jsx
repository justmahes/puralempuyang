import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Sunrise } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

// Data Highlights
const heroHighlights = [
  {
    icon: Sunrise,
    title: 'Golden Hour Pilgrimage',
    detail:
      'Slot sunrise 05.30 – 08.00 WITA plus jalur foto prioritas untuk hasil terbaik.',
    meta: 'Sunrise',
  },
  {
    icon: Sparkles,
    title: 'Fast Lane Booking',
    detail:
      'Pilih jadwal favorit, bayar via Midtrans, tiket QR terkirim kurang dari 2 menit.',
    meta: 'Instan',
  },
  {
    icon: ShieldCheck,
    title: 'On-site Assistance',
    detail:
      'Operator siaga memvalidasi QR dan mengarahkan Anda tanpa antre panjang.',
    meta: 'Petugas 24/7',
  },
];

// Statistik Hero
const heroStats = [
  { label: 'Peziarah percaya', value: '120K+' },
  { label: 'Operator aktif', value: '40+' },
];

const getHeroContent = (locale) => {
  const isEn = locale === 'en';
  return {
    badge: 'Dharma & Digital',
    headline: isEn
      ? 'Enjoy a guided spiritual journey to the Gate of Heaven—no long queues, still full of meaning.'
      : 'Nikmati perjalanan spiritual menuju Gate of Heaven yang kini lebih terarah, tanpa antre, dan tetap penuh makna.',
    subhead: isEn
      ? 'We blend the sacred atmosphere of Pura Lempuyang with a modern reservation system. Book a slot, track quota, and receive your QR ticket in one simple flow.'
      : 'Kami memadukan atmosfer spiritual Pura Lempuyang dengan sistem reservasi modern. Pesan slot, pantau kuota, dan terima QR tiket dalam satu langkah sederhana.',
    ctaPrimary: isEn ? 'Book Tickets' : 'Pesan Tiket Sekarang',
    ctaSecondary: isEn ? 'See Journey Flow' : 'Lihat Alur Perjalanan',
    panelTitle: isEn ? 'Meaningful experiences, curated' : 'Kurasi pengalaman penuh makna',
    panelDesc: isEn
      ? 'Focus on the sacred moments; we handle queues, payments, and access.'
      : 'Fokus pada hal-hal sakral di pura, biarkan platform kami menangani antrean, pembayaran, dan akses.',
    stats: [
      { label: isEn ? 'Trusted pilgrims' : 'Peziarah percaya', value: '120K+' },
      { label: isEn ? 'Active operators' : 'Operator aktif', value: '40+' },
    ],
  };
};

// Variants untuk animasi Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const Hero = () => {
  const { locale } = useI18n();
  const content = getHeroContent(locale);

  return (
  <section
    className="relative isolate overflow-hidden hero-gate bg-cover bg-center scroll-mt-28"
    id="hero"
  >
    {/* Overlay gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-ebony/90 via-ebony/70 to-ebony/80" />

    {/* Konten utama */}
    <div className="relative mx-auto grid min-h-[90vh] max-w-6xl items-center gap-12 px-6 py-24 text-white md:grid-cols-[1.1fr_0.9fr]">
      {/* Kiri - Teks Hero */}
      <div className="space-y-6">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-1 text-[11px] uppercase tracking-[0.35em]"
        >
          {content.badge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl"
        >
          {content.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl text-base text-white/80 sm:text-lg"
        >
          {content.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/booking"
            className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ebony shadow-glow transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {content.ctaPrimary}
          </Link>
          <a
            href="#journey"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            {content.ctaSecondary}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-8 text-xs uppercase tracking-widest text-white/70"
        >
          {content.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              {stat.label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Kanan - Glass Highlight Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-panel relative overflow-hidden rounded-[32px] bg-white/75 backdrop-blur-md p-6 text-ebony shadow-2xl border border-white/30"
      >
        {/* Overlay lembut */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60" />
        <div className="relative space-y-3">
          {/* Header Panel */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-ebony/60">
            <span>Highlights</span>
            <span className="rounded-full bg-gold/10 px-3 py-0.5 font-semibold text-gold">
              Realtime Guide
            </span>
          </div>

          <h3 className="font-display text-[22px] leading-snug">
            {content.panelTitle}
          </h3>

          <p className="text-[13px] text-ebony/70 leading-relaxed">
            {content.panelDesc}
          </p>

          {/* Highlight Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="pt-2 space-y-2"
          >
            {heroHighlights.map(({ icon: Icon, title, detail, meta }) => (
              <motion.div
                key={title}
                variants={cardVariants}
                className="flex items-start gap-3 rounded-xl border border-white/40 bg-white/80 backdrop-blur-sm p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="mt-0.5 inline-flex rounded-xl bg-gold/10 p-2 text-gold">
                  <Icon size={16} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold uppercase tracking-wide text-ebony">
                      {title}
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
                      {meta}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-snug text-ebony/80">
                    {detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

export default Hero;
