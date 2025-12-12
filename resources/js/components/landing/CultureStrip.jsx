import { motion } from 'framer-motion';
import { LayoutDashboard, Sunrise, QrCode, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

const accents = [
  {
    icon: LayoutDashboard,
    title: 'Pengalaman Tertata',
    desc: 'Pemesanan tiket berlangsung lancar. Dari pilihan jadwal hingga validasi QR di lokasi.'
  },
  {
    icon: Sunrise,
    title: 'Momentum Terbaik',
    desc: 'Pilih slot sunrise atau golden hour untuk momen spiritual dan foto terbaik di Gate of Heaven.'
  },
  {
    icon: QrCode,
    title: 'Tiket Digital Praktis',
    desc: 'Pembayaran aman melalui Midtrans, QR tiket langsung terkirim untuk akses tanpa antre panjang.'
  },
  {
    icon: Sparkles,
    title: 'Nuansa Luhur',
    desc: 'Desain dan pengalaman pengguna terinspirasi dari harmoni budaya Bali dan keindahan Pura Lempuyang.'
  },
];



const CultureStrip = () => {
  const { locale } = useI18n();
  const isEn = locale === 'en';
  const items = [
    {
      icon: LayoutDashboard,
      title: isEn ? 'Structured Experience' : 'Pengalaman Tertata',
      desc: isEn
        ? 'Smooth ticket booking from choosing a schedule to on-site QR validation.'
        : 'Pemesanan tiket berlangsung lancar. Dari pilihan jadwal hingga validasi QR di lokasi.',
    },
    {
      icon: Sunrise,
      title: isEn ? 'Best Moments' : 'Momentum Terbaik',
      desc: isEn
        ? 'Choose sunrise or golden hour slots for the best spiritual and photo moments.'
        : 'Pilih slot sunrise atau golden hour untuk momen spiritual dan foto terbaik di Gate of Heaven.',
    },
    {
      icon: QrCode,
      title: isEn ? 'Practical Digital Tickets' : 'Tiket Digital Praktis',
      desc: isEn
        ? 'Secure payments via Midtrans, QR tickets delivered instantly.'
        : 'Pembayaran aman melalui Midtrans, QR tiket langsung terkirim untuk akses tanpa antre panjang.',
    },
    {
      icon: Sparkles,
      title: isEn ? 'Sacred Atmosphere' : 'Nuansa Luhur',
      desc: isEn
        ? 'Design inspired by Balinese harmony and Pura Lempuyang beauty.'
        : 'Desain dan pengalaman pengguna terinspirasi dari harmoni budaya Bali dan keindahan Pura Lempuyang.',
    },
  ];

  return (
  <section className="bg-gradient-to-r from-cream via-white to-cream dark:from-ebony dark:via-charcoal dark:to-ebony/90">
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-cream/40 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/5 dark:bg-white/5"
          >
            <div className="mb-3 inline-flex rounded-2xl bg-gold/15 p-3 text-gold">
              <Icon size={18} />
            </div>
            <h3 className="font-semibold text-lg text-ebony dark:text-cream">{title}</h3>
            <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default CultureStrip;
