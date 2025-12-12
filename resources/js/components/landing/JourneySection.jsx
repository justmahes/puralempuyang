import { motion } from 'framer-motion';
import { CalendarCheck, MapPin, Sparkles, Camera } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

const steps = [
  {
    icon: CalendarCheck,
    title: 'Pilih Slot & Pembayaran',
    desc: 'Lihat kuota real-time, pilih waktu favorit, dan lakukan pembayaran aman melalui Midtrans Snap.',
    badge: 'Step 01'
  },
  {
    icon: MapPin,
    title: 'Briefing & Persiapan',
    desc: 'Dashboard menampilkan prakiraan cuaca dan pengingat pakaian sopan sebelum menuju area suci.',
    badge: 'Step 02'
  },
  {
    icon: Sparkles,
    title: 'Pengalaman di Lokasi',
    desc: 'Petugas memindai QR Anda, memberikan arahan menuju area persembahyangan, dan membantu sesi foto.',
    badge: 'Step 03'
  },
  {
    icon: Camera,
    title: 'Kenangan & Dokumentasi',
    desc: 'Foto-foto perjalanan dapat dilihat kembali melalui akun Anda setelah kunjungan selesai.',
    badge: 'Step 04'
  },
];

const JourneySection = () => {
  const { locale } = useI18n();
  const isEn = locale === 'en';
  const items = [
    {
      icon: CalendarCheck,
      title: isEn ? 'Choose Slot & Pay' : 'Pilih Slot & Pembayaran',
      desc: isEn
        ? 'See real‑time quota, pick your time, and pay securely via Midtrans Snap.'
        : 'Lihat kuota real-time, pilih waktu favorit, dan lakukan pembayaran aman melalui Midtrans Snap.',
      badge: 'Step 01',
    },
    {
      icon: MapPin,
      title: isEn ? 'Briefing & Preparation' : 'Briefing & Persiapan',
      desc: isEn
        ? 'Your dashboard shows weather and attire reminders before you enter the sacred area.'
        : 'Dashboard menampilkan prakiraan cuaca dan pengingat pakaian sopan sebelum menuju area suci.',
      badge: 'Step 02',
    },
    {
      icon: Sparkles,
      title: isEn ? 'On‑site Experience' : 'Pengalaman di Lokasi',
      desc: isEn
        ? 'Staff scan your QR, guide you to worship areas, and assist photo sessions.'
        : 'Petugas memindai QR Anda, memberikan arahan menuju area persembahyangan, dan membantu sesi foto.',
      badge: 'Step 03',
    },
    {
      icon: Camera,
      title: isEn ? 'Memories & Photos' : 'Kenangan & Dokumentasi',
      desc: isEn
        ? 'Your photos will be available in your account after the visit.'
        : 'Foto-foto perjalanan dapat dilihat kembali melalui akun Anda setelah kunjungan selesai.',
      badge: 'Step 04',
    },
  ];

  return (
  <section id="journey" className="section-padding scroll-mt-28 bg-white dark:bg-charcoal">
    <div className="mx-auto max-w-6xl px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Journey Map</p>
        <h2 className="mt-2 font-display text-3xl text-ebony dark:text-white">
          {isEn ? 'A gentle but guided journey flow' : 'Alur perjalanan yang lembut namun terarah'}
        </h2>
        <p className="mt-3 text-sm text-ebony/70 dark:text-cream/70 max-w-2xl mx-auto">
         {isEn
           ? 'Each step is designed so your visit stays orderly, comfortable, and spiritually meaningful.'
           : 'Setiap langkah dirancang agar perjalanan Anda di Pura Lempuyang berlangsung tertib, nyaman, dan penuh makna spiritual.'}
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {items.map(({ icon: Icon, title, desc, badge }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-ebony/10 bg-white/90 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gold">
              <span>{badge}</span>
              <Icon size={18} />
            </div>
            <h3 className="mt-4 font-semibold text-ebony dark:text-cream">{title}</h3>
            <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default JourneySection;
