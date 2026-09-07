import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useMidtransSnap } from '../hooks/useMidtransSnap';
import { useI18n } from '../i18n/I18nContext';

const PRICE_RANGE = {
  domestic: { label: 'Rp 30.000,00', base: 30000 },
  international: { label: 'Rp 55.000,00', base: 55000 },
};

const BookingPage = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isReady, openSnap } = useMidtransSnap();

  // Setiap sesi melayani kedua tarif; harga ditentukan per pengunjung.
  const categoryPillLabel = `Domestik ${PRICE_RANGE.domestic.label} - Mancanegara ${PRICE_RANGE.international.label}`;

  const { data: slots } = useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.slots);
      return data.data || [];
    },
  });

  const [selectedSlot, setSelectedSlot] = useState(null);
  // Jumlah pengunjung per tarif — satu pesanan boleh memuat WNI dan WNA sekaligus.
  const [counts, setCounts] = useState({ domestic: 0, international: 0 });

  // Satu sesi kini menjual kedua tarif, jadi tidak ada lagi penyaringan slot.
  const displaySlots = slots || [];

  // Sesi lama (sebelum tarif dipisah) belum punya `tiers`; pakai harganya sendiri.
  const tiers = useMemo(() => {
    if (!selectedSlot) return [];
    if (selectedSlot.tiers?.length) return selectedSlot.tiers;
    return [{
      category: selectedSlot.ticket_category || 'domestic',
      label: selectedSlot.ticket_category === 'international' ? 'Mancanegara (WNA)' : 'Domestik (WNI)',
      price: selectedSlot.price ?? PRICE_RANGE[selectedSlot.ticket_category]?.base ?? 0,
    }];
  }, [selectedSlot]);

  const totalGuests = (counts.domestic || 0) + (counts.international || 0);
  const totalPrice = tiers.reduce(
    (sum, tier) => sum + (counts[tier.category] || 0) * Number(tier.price || 0),
    0
  );

  // Isi awal mengikuti kategori akun, tapi tetap bisa diubah untuk rombongan.
  useEffect(() => {
    if (!selectedSlot) return;
    setCounts((prev) => {
      if ((prev.domestic || 0) + (prev.international || 0) > 0) return prev;
      const preferred = user?.citizenship_type === 'international' ? 'international' : 'domestic';
      return { domestic: 0, international: 0, [preferred]: 1 };
    });
  }, [selectedSlot, user?.citizenship_type]);

  useEffect(() => {
    if (selectedSlot && !displaySlots.some((slot) => slot.id === selectedSlot.id)) {
      setSelectedSlot(null);
    }
  }, [displaySlots, selectedSlot]);

  const handlePay = async () => {
    if (!user) {
      toast.error(t('booking.loginFirst'));
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      toast.error(t('booking.selectSchedule'));
      return;
    }
    if (totalGuests < 1) {
      toast.error('Tentukan jumlah pengunjung terlebih dahulu');
      return;
    }
    if (totalGuests > selectedSlot.quota_remaining) {
      toast.error('Kuota sesi ini tidak mencukupi');
      return;
    }

    try {
      const { data } = await api.post(endpoints.paymentToken, {
        slot_id: selectedSlot.id,
        lines: tiers
          .map((tier) => ({ category: tier.category, quantity: counts[tier.category] || 0 }))
          .filter((line) => line.quantity > 0),
      });

      toast.success('Memproses pembayaran...');
      openSnap(data.token, {
        onSuccess: async (snapResult) => {
          let redirectToDashboard = true;
          try {
            await api.post(endpoints.paymentVerify, {
              order_code: data.order_code,
              snap_payload: snapResult,
            });
            toast.success('Pembayaran sukses!');
          } catch (error) {
            if (error.response?.status === 401) {
              toast.error('Sesi Anda telah berakhir, silakan login kembali.');
              navigate('/login');
              redirectToDashboard = false;
            } else {
              toast.error(
                error.response?.data?.message ||
                  'Pembayaran berhasil, tapi status belum tersinkron. Cek dashboard Anda.'
              );
            }
          } finally {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (redirectToDashboard) navigate('/dashboard');
          }
        },
        onPending: () => toast('Menunggu konfirmasi Midtrans'),
        onClose: () => toast('Anda menutup Snap sebelum membayar'),
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Sesi Anda telah berakhir, silakan login kembali.');
        navigate('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Gagal memulai pembayaran.');
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
<main className="mx-auto max-w-6xl px-6 pt-28 pb-20">
  <div className="flex flex-col-reverse lg:flex-row lg:items-start lg:justify-between gap-10">
    
    {/* BAGIAN KIRI - SLOT KUNJUNGAN */}
    <section className="flex-1 space-y-4">
      <h1 className="font-display text-3xl">{t('booking.title')}</h1>
      <p className="text-xs uppercase tracking-[0.4em] text-gold">{categoryPillLabel}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {displaySlots.length ? (
          displaySlots.map((slot) => (
            <motion.button
              whileHover={{ scale: 1.01 }}
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              className={`rounded-3xl border px-4 py-5 text-left transition-all ${
                selectedSlot?.id === slot.id
                  ? 'border-gold bg-gold/10 shadow-md'
                  : 'border-cream/80 bg-white hover:border-gold/40 hover:shadow-sm dark:bg-charcoal'
              }`}
            >
              <p className="text-sm text-gold">{slot.ticket_name}</p>
              <p className="mt-2 text-xl font-semibold">
                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
              </p>
              <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">
                {t('booking.remainingQuota', { remaining: slot.quota_remaining, total: slot.quota_total })}
              </p>
              <div className="mt-3 space-y-1 text-sm">
                {(slot.tiers?.length
                  ? slot.tiers
                  : [{ category: slot.ticket_category, label: null, price: slot.price }]
                ).map((tier) => (
                  <div key={tier.category} className="flex items-center justify-between">
                    <span className="text-xs text-ebony/60 dark:text-cream/60">
                      {tier.category === 'international' ? 'Mancanegara' : 'Domestik'}
                    </span>
                    <span className="font-semibold">Rp {Number(tier.price).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </motion.button>
          ))
        ) : (
          <p className="text-sm text-ebony/70 dark:text-cream/70">
            {t('booking.noSlots')}
          </p>
        )}
      </div>
    </section>

    {/* BAGIAN KANAN - RINGKASAN PEMBELIAN */}
    <aside className="lg:w-[340px] w-full">
      <div className="rounded-3xl bg-white/90 backdrop-blur-md p-6 shadow-lg dark:bg-white/10 dark:shadow-none">
        <h3 className="font-semibold text-sm text-gold uppercase tracking-[0.2em]">
          {t('booking.summary')}
        </h3>

        <div className="mt-5 space-y-5 text-sm">
          {/* Slot */}
          <div>
            <p className="text-[11px] uppercase text-ebony/60 dark:text-cream/60 mb-1">{t('booking.slot')}</p>
            <p className="text-base font-semibold">
              {selectedSlot ? selectedSlot.ticket_name : (
                <span className="text-ebony/40">Belum dipilih</span>
              )}
            </p>
          </div>

          {/* Jumlah Orang per Tarif */}
          <div>
            <p className="text-[11px] uppercase text-ebony/60 dark:text-cream/60 mb-2">{t('booking.people')}</p>
            {selectedSlot ? (
              <div className="space-y-3">
                {tiers.map((tier) => (
                  <div key={tier.category} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {tier.label || (tier.category === 'international' ? 'Mancanegara (WNA)' : 'Domestik (WNI)')}
                      </p>
                      <p className="text-xs text-ebony/60 dark:text-cream/60">
                        Rp {Number(tier.price).toLocaleString('id-ID')} / orang
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Kurangi ${tier.category}`}
                        onClick={() =>
                          setCounts((c) => ({ ...c, [tier.category]: Math.max(0, (c[tier.category] || 0) - 1) }))
                        }
                        className="h-8 w-8 rounded-full border border-cream/70 text-lg leading-none hover:bg-cream/40 dark:border-white/20"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-lg font-semibold">{counts[tier.category] || 0}</span>
                      <button
                        type="button"
                        aria-label={`Tambah ${tier.category}`}
                        disabled={totalGuests >= Math.min(10, selectedSlot.quota_remaining)}
                        onClick={() =>
                          setCounts((c) => ({ ...c, [tier.category]: (c[tier.category] || 0) + 1 }))
                        }
                        className="h-8 w-8 rounded-full border border-cream/70 text-lg leading-none hover:bg-cream/40 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-ebony/60 dark:text-cream/60">
                  Rombongan campuran WNI dan WNA bisa dipesan sekaligus. Maksimal 10 tiket per pesanan.
                </p>
              </div>
            ) : (
              <p className="text-sm text-ebony/40">Pilih sesi terlebih dahulu</p>
            )}
          </div>

          {/* Total Pembayaran */}
          <div className="border-t border-cream/40 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{t('booking.total')}</p>
              <span className="text-lg font-semibold text-gold">
                {selectedSlot && totalGuests ? `Rp ${totalPrice.toLocaleString('id-ID')}` : '-'}
              </span>
            </div>
            <p className="mt-1 text-xs text-ebony/60 dark:text-cream/60">
              {totalGuests
                ? `${totalGuests} pengunjung${
                    counts.domestic && counts.international
                      ? ` (${counts.domestic} WNI + ${counts.international} WNA)`
                      : ''
                  }`
                : 'Belum ada pengunjung dipilih'}
            </p>
          </div>
        </div>

        {/* Tombol Bayar */}
        <button
          onClick={handlePay}
          disabled={!isReady}
          className="mt-6 w-full rounded-xl bg-gold py-3 text-sm font-semibold text-ebony shadow transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isReady ? t('booking.pay') : t('booking.loadingPay')}
        </button>
      </div>
    </aside>
  </div>
</main>

      <Footer />
    </div>
  );
};

export default BookingPage;
