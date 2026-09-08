import { motion } from 'framer-motion';
import { Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { formatCurrency } from '../../utils/format';

const availabilityBadge = (remaining, t) => {
  if (remaining <= 5) {
    return { label: t('schedule.quotaCritical'), style: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100' };
  }
  if (remaining <= 15) {
    return { label: t('schedule.quotaLow'), style: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100' };
  }
  return { label: t('schedule.quotaSafe'), style: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-100' };
};

const ScheduleShowcase = ({ slots = [] }) => {
  const { user } = useAuth();
  const { locale, t } = useI18n();
  const isEn = locale === 'en';

  // Satu sesi melayani kedua tarif, jadi tidak ada lagi penyaringan per kategori.
  // Yang ditampilkan adalah tarif yang berlaku untuk pengunjung ini.
  const viewerCategory = user?.citizenship_type || 'domestic';

  const preview = (slots || []).slice(0, 6);
  const emptyMessage = isEn
    ? 'No slots available right now.'
    : 'Belum ada slot tersedia saat ini.';

  const priceFor = (slot) => {
    const tier = slot.tiers?.find((entry) => entry.category === viewerCategory);
    return Number(tier?.price ?? slot.price ?? 0);
  };

  return (
    <section id="jadwal" className="section-padding scroll-mt-28 bg-gradient-to-b from-white via-cream to-white dark:from-charcoal dark:via-ebony dark:to-charcoal">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-gold">Realtime capacity</p>
            <h2 className="font-display text-3xl">
              {isEn ? 'Most popular schedules this week' : 'Jadwal paling diminati minggu ini'}
            </h2>
            <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">
              {isEn
                ? 'Always synced with on-site operators. Pick sunrise or golden hour without worrying about quota.'
                : 'Data selalu disinkronkan dengan operator lapangan. Pilih slot sesuai mood sunrise atau golden hour tanpa khawatir kehabisan.'}
            </p>
          </div>
          <Link to="/booking" className="rounded-full bg-ebony px-6 py-3 text-sm font-semibold text-cream shadow-lg shadow-ebony/30 hover:-translate-y-0.5 dark:bg-gold dark:text-ebony">
            {isEn ? 'See all slots' : 'Lihat semua slot'}
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {preview.length ? (
            preview.map((slot, idx) => {
              const badge = availabilityBadge(slot.quota_remaining, t);
              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-3xl border border-cream/70 bg-white p-6 shadow-xl shadow-amber-50/60 dark:border-white/10 dark:bg-ebony"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gold">
                      <Calendar size={16} />
                      {format(new Date(slot.visit_date), 'EEEE, d MMM', { locale: isEn ? enUS : id })}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em]">
                    <span className="rounded-full bg-ebony/5 px-3 py-1 text-ebony dark:bg-white/10 dark:text-white">
                      {viewerCategory === 'international'
                        ? isEn ? 'International' : 'Mancanegara'
                        : isEn ? 'Domestic' : 'Domestik'}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold text-lg">{slot.ticket_name}</h3>
                  <p className="text-sm text-ebony/70 dark:text-cream/70">
                    {formatCurrency(priceFor(slot), locale)} - {slot.quota_total} {t('schedule.quota')}
                  </p>
                  <div className="mt-5 rounded-2xl bg-ebony/5 p-4 text-sm dark:bg-white/5">
                    <p className="flex items-center gap-2 text-ebony dark:text-white">
                      <Clock size={16} /> {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-ebony/70 dark:text-cream/70">
                      <Users size={16} /> {t('schedule.remaining')} {slot.quota_remaining} {t('schedule.visitors')} {t('schedule.remainingSuffix')}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="col-span-full text-sm text-ebony/60 dark:text-cream/70">{emptyMessage}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ScheduleShowcase;
