import { motion } from 'framer-motion';
import { useI18n } from '../../i18n/I18nContext';

const GallerySection = () => {
  const { locale } = useI18n();
  const isEn = locale === 'en';
  const galleryItems = [
    {
      title: isEn ? 'Temple Pemangku' : 'Pemangku Pura',
      caption: isEn
        ? 'Pemangku wait in the pavilion, keeping the rhythm of every ceremony calm.'
        : 'Pemangku menanti di bale pura, menjaga ritme setiap upacara tetap tenang.',
      tag: isEn ? 'Ceremony' : 'Upacara',
      image: '/images/gallery/upacara-pemangku-lempuyang.jpg',
    },
    {
      title: isEn ? 'Gate of Heaven' : 'Gerbang Surga',
      caption: isEn
        ? 'Mount Agung silhouettes create a favorite photo backdrop.'
        : 'Siluet Gunung Agung menjadi latar foto favorit wisatawan mancanegara.',
      tag: isEn ? 'Panorama' : 'Panorama',
      image: '/images/gallery/gate-of-heaven-gunung-agung.jpg',
      objectPosition: 'center bottom',
    },
    {
      title: isEn ? 'Canang Sari' : 'Canang Sari',
      caption: isEn
        ? 'Offerings arranged each morning greet visitors at the courtyard.'
        : 'Canang sari yang dirangkai setiap pagi menyambut umat di pelataran pura.',
      tag: isEn ? 'Culture' : 'Budaya',
      image: '/images/gallery/canang-sari.jpg',
    },
    {
      title: isEn ? 'Stairway to the Temple' : 'Jalur Tangga Pura',
      caption: isEn
        ? 'Long stone steps to the main courtyard, flanked by paduraksa gates.'
        : 'Anak tangga batu menuju pelataran utama, diapit gerbang paduraksa.',
      tag: isEn ? 'Journey' : 'Perjalanan',
      image: '/images/gallery/jalur-tangga-pura-lempuyang.jpg',
    },
  ];

  return (
  <section id="galeri" className="section-padding scroll-mt-28 bg-gradient-to-b from-white via-cream/40 to-white dark:from-charcoal dark:via-ebony dark:to-charcoal">
    <div className="mx-auto max-w-6xl px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-gold">{isEn ? 'Gallery' : 'Galeri'}</p>
          <h2 className="font-display text-3xl">
            {isEn ? 'Culture & panoramas we celebrate' : 'Budaya & panorama yang kami rayakan'}
          </h2>
          <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">
            {isEn
              ? 'A gentle visual showcase that brings Pura Lempuyang to your screen.'
              : 'Sorotan visual bergerak lembut saat Anda menggulir, menghadirkan nuansa Pura Lempuyang langsung ke layar.'}
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
              style={{ objectPosition: item.objectPosition ?? 'center' }}
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
      <p className="mt-6 text-center text-xs text-ebony/50 dark:text-cream/50">
        {isEn ? 'Photos: ' : 'Foto: '}
        Vyacheslav Argenberg (CC BY 4.0), Azeusss (CC0), Enrico Strocchi (CC BY-SA 2.0),
        yeowatzup (CC BY 2.0) &middot; Wikimedia Commons
      </p>
    </div>
  </section>
  );
};

export default GallerySection;
