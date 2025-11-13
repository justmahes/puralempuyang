import { motion } from 'framer-motion';

const galleryItems = [
  {
    title: 'Prosesi Penyineban',
    caption: 'Momen teduh ketika dupa pertama dinyalakan, ditemani kabut lembah.',
    tag: 'Upacara',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Gerbang Surga',
    caption: 'Siluet Gunung Agung menjadi latar foto favorit wisatawan mancanegara.',
    tag: 'Panorama',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Ritual Canang',
    caption: 'Ibu-ibu krama menyiapkan canang sari sebelum rombongan memasuki pelataran.',
    tag: 'Budaya',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Jalur Mendaki',
    caption: 'Rimbun pepohonan menuju Pura Lempuyang selalu menghadirkan udara segar.',
    tag: 'Perjalanan',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  },
];

const GallerySection = () => (
  <section id="galeri" className="section-padding scroll-mt-28 bg-gradient-to-b from-white via-cream/40 to-white dark:from-charcoal dark:via-ebony dark:to-charcoal">
    <div className="mx-auto max-w-6xl px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-gold">Galeri</p>
          <h2 className="font-display text-3xl">Budaya & panorama yang kami rayakan</h2>
          <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">
            Sorotan visual bergerak lembut saat Anda menggulir, menghadirkan nuansa Pura Lempuyang langsung ke layar.
          </p>
        </div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {galleryItems.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative h-64 overflow-hidden rounded-3xl shadow-lg"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ebony/80 via-ebony/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
              <span className="mb-2 inline-flex w-fit rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]">
                {item.tag}
              </span>
              <p className="text-lg font-semibold">{item.title}</p>
              <p className="text-sm text-white/70">{item.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default GallerySection;
