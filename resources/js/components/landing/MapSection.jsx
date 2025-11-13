import { motion } from 'framer-motion';
import { Clock8, MapPin, ShieldCheck } from 'lucide-react';

const tips = [
  {
    icon: Clock8,
    text: 'Perjalanan dari Denpasar 2,5 jam,  alokasikan waktu untuk menyiapkan persembahan.'
  },
  {
    icon: ShieldCheck,
    text: 'Datang 30 menit sebelum slot untuk briefing busana, kain kamen, dan selendang.'
  },
  {
    icon: MapPin,
    text: 'Ikuti jalur shuttle resmi agar perjalanan lebih nyaman dan ramah lingkungan.'
  },
];

const MapSection = () => (
  <section id="lokasi" className="section-padding scroll-mt-28 bg-white dark:bg-charcoal">
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-gold">Lokasi</p>
          <h2 className="font-display text-3xl">Pura Lempuyang Luhur, Karangasem</h2>
          <p className="mt-4 text-sm text-ebony/70 dark:text-cream/70">
            Infrastruktur digital kami terhubung langsung dengan petugas. Begitu pembayaran berhasil, QR tiket dan panduan budaya dikirim ke email maupun dashboard.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {tips.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-1 inline-flex rounded-full bg-gold/15 p-2 text-gold"><Icon size={16} /></span>
                <span className="text-ebony/80 dark:text-cream/80">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl shadow-glow"
        >
          <iframe
            title="Pura Lempuyang"
            width="100%"
            height="360"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15788.266639129428!2d115.6235257268905!3d-8.395104838455893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd2071753222893%3A0x40a0fd58fe779263!2sPura%20Penataran%20Agung%20Lempuyang!5e0!3m2!1sid!2sid!4v1762977815218!5m2!1sid!2sid"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

export default MapSection;