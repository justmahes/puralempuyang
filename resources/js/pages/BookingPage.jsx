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

  const userCategoryLabel = user?.citizenship_type === 'international' ? 'Mancanegara' : 'Domestik';
  const activePriceInfo = user?.citizenship_type ? PRICE_RANGE[user.citizenship_type] : null;
  const categoryPillLabel = user?.citizenship_type
    ? [userCategoryLabel, activePriceInfo?.label].filter(Boolean).join(' - ')
    : 'Semua kategori pengunjung';

  const { data: slots } = useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.slots);
      return data.data || [];
    },
  });

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const filteredSlots = useMemo(() => {
    if (!slots?.length) return [];
    if (!user?.citizenship_type) return slots;
    return slots.filter((slot) => slot.ticket_category === user.citizenship_type);
  }, [slots, user?.citizenship_type]);

  const displaySlots = filteredSlots;

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
    if (!user?.citizenship_type) {
      toast.error(t('booking.fillVisitorType'));
      navigate('/profile');
      return;
    }
    if (selectedSlot.ticket_category && selectedSlot.ticket_category !== user.citizenship_type) {
      toast.error(t('booking.slotMismatch'));
      return;
    }

    try {
      const { data } = await api.post(endpoints.paymentToken, {
        slot_id: selectedSlot.id,
        quantity,
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
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-ebony/5 px-3 py-1 text-ebony dark:bg-white/10 dark:text-white">
                  {slot.ticket_category === 'international' ? 'Mancanegara' : 'Domestik'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gold">{slot.ticket_name}</p>
              <p className="mt-2 text-xl font-semibold">
                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
              </p>
              <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">
                {t('booking.remainingQuota', { remaining: slot.quota_remaining, total: slot.quota_total })}
              </p>
              <p className="mt-3 font-semibold">
                Rp {Number(slot.price).toLocaleString('id-ID')}
              </p>
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

          {/* Jumlah Orang */}
          <div>
            <p className="text-[11px] uppercase text-ebony/60 dark:text-cream/60 mb-2">{t('booking.people')}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 rounded-full border border-cream/70 text-lg leading-none hover:bg-cream/40 dark:border-white/20"
              >
                −
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="h-8 w-8 rounded-full border border-cream/70 text-lg leading-none hover:bg-cream/40 dark:border-white/20"
              >
                +
              </button>
            </div>
          </div>

          {/* Total Pembayaran */}
          <div className="border-t border-cream/40 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{t('booking.total')}</p>
              <span className="text-lg font-semibold text-gold">
                {selectedSlot
                  ? `Rp ${(quantity * (selectedSlot.price ?? PRICE_RANGE[selectedSlot.ticket_category]?.base ?? 0)).toLocaleString('id-ID')}`
                  : '-'}
              </span>
            </div>
            <p className="mt-1 text-xs text-ebony/60 dark:text-cream/60">
              {selectedSlot
                ? `Rentang tarif ${PRICE_RANGE[selectedSlot.ticket_category]?.label}`
                : activePriceInfo
                ? `Rentang tarif ${activePriceInfo.label}`
                : 'Rentang tarif Rp 30.000,00'}
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
