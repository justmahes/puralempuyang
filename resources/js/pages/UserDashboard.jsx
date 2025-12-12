import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/dashboard/TicketCard';
import QrModal from '../components/dashboard/QrModal';
import MetricCard from '../components/dashboard/MetricCard';
import { CreditCard, TicketCheck, Timer } from 'lucide-react';
import { useMidtransSnap } from '../hooks/useMidtransSnap';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';

const UserDashboard = () => {
  const { token } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { openSnap, isReady } = useMidtransSnap();
  const [selectedTickets, setSelectedTickets] = useState(null);
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.orders);
      return data.data || [];
    },
    enabled: Boolean(token),
  });

  const { data: myPhotos = [] } = useQuery({
    queryKey: ['my-photos'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.photoMyAssets);
      return data.data || [];
    },
  });

  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, page]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paidOrders = orders?.filter((order) => order.status === 'paid') || [];
    const total = paidOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
    const active = paidOrders.length;
    const upcoming = paidOrders.filter((order) => {
      if (!order.visit_date) return false;
      const visitDate = new Date(order.visit_date);
      if (Number.isNaN(visitDate.getTime())) return false;
      visitDate.setHours(0, 0, 0, 0);
      return visitDate >= today;
    }).length;

    return { total, active, upcoming };
  }, [orders]);

  const recentPaid = useMemo(() => (orders || []).find((o) => o.status === 'paid'), [orders]);
  const [orderFromRedirect, setOrderFromRedirect] = useState('');
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const ord = q.get('order');
    if (ord) setOrderFromRedirect(ord);
  }, []);
  const effectiveOrderCode = orderFromRedirect || recentPaid?.order_code || '';

  // Antrean Foto inline on dashboard
  const { data: photoPoints = [] } = useQuery({
    queryKey: ['photo-points'],
    queryFn: async () => (await api.get(endpoints.photoPoints)).data.data || [],
  });
  const [photoPointId, setPhotoPointId] = useState(null);
  useEffect(() => {
    if (!photoPointId && photoPoints?.length) setPhotoPointId(photoPoints[0].id);
  }, [photoPoints, photoPointId]);
  const [photoStatus, setPhotoStatus] = useState(null);
  const joinPhotoQueue = async () => {
    if (!effectiveOrderCode) {
      toast.error(t('dashboard.noActiveOrder'));
      return;
    }
    if (!photoPointId) {
      toast.error(t('dashboard.selectPointFirst'));
      return;
    }
    try {
      await api.post(endpoints.photoEnqueue, { point_id: photoPointId, order_code: effectiveOrderCode });
      toast.success(t('dashboard.joinQueue'));
      await checkPhotoStatus();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Gagal masuk antrean');
    }
  };
  const checkPhotoStatus = async () => {
    if (!effectiveOrderCode) return setPhotoStatus(null);
    try {
      const { data } = await api.get(endpoints.photoStatus, { params: { order_code: effectiveOrderCode } });
      setPhotoStatus(data);
    } catch {
      setPhotoStatus(null);
    }
  };
  useEffect(() => { checkPhotoStatus(); }, [effectiveOrderCode]);

  const handleContinuePayment = async (order) => {
    if (!isReady) {
      toast.error('Midtrans belum siap, tunggu sebentar.');
      return;
    }
    try {
      const { data: response } = await api.post(endpoints.paymentToken, { order_code: order.order_code });
      openSnap(response.token, {
        onSuccess: async (snapResult) => {
          try {
            await api.post(endpoints.paymentVerify, {
              order_code: response.order_code || order.order_code,
              snap_payload: snapResult,
            });
            toast.success('Pembayaran berhasil');
          } catch (err) {
            if (err.response?.status === 401) {
              // Auth interceptor will handle logout + toast.
              return;
            }
            toast.error(err.response?.data?.message || 'Gagal sinkronisasi status pembayaran');
          } finally {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
          }
        },
        onPending: () => toast('Menunggu konfirmasi Midtrans'),
        onClose: () => {
          toast('Pembayaran belum selesai');
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
      });
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Gagal melanjutkan pembayaran');
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-28 pb-20 space-y-10">
        <div>
          <p className="text-sm text-gold">{t('dashboard.welcome')}</p>
          <h1 className="font-display text-3xl">{t('dashboard.dashboard')}</h1>
        </div>

        {orderFromRedirect ? (
          <div className="rounded-2xl border border-cream/60 p-4 text-sm dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Pembayaran berhasil untuk order {orderFromRedirect}</p>
                <p className="text-ebony/70 dark:text-cream/70">Ingin langsung bergabung ke antrean foto?</p>
              </div>
              <a
                href={`/photo-queue?order=${encodeURIComponent(orderFromRedirect)}`}
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ebony"
              >
                Gabung Antrean Foto
              </a>
            </div>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Total Pembelian" value={`Rp ${stats.total.toLocaleString('id-ID')}`} icon={CreditCard} />
          <MetricCard title="Tiket Aktif" value={stats.active} icon={TicketCheck} />
          <MetricCard title="Jadwal Mendatang" value={stats.upcoming} icon={Timer} />
        </div>
        <section className="space-y-4">
          <div>
            <p className="text-sm text-gold">{t('dashboard.myTickets')}</p>
            <h1 className="font-display text-3xl">{t('dashboard.allTransactions')}</h1>
          </div>
          <div className="grid gap-4">
            {paginatedOrders.length ? (
              paginatedOrders.map((order) => (
                <TicketCard
                  key={order.id}
                  order={order}
                  onShowQr={(selectedOrder) => setSelectedTickets(selectedOrder.items)}
                  onContinuePayment={handleContinuePayment}
                />
              ))
            ) : (
              <p className="text-sm text-ebony/70">{t('dashboard.noTransactions')}</p>
            )}
          </div>
          {orders.length > PAGE_SIZE && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-full border border-cream/70 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-full font-semibold ${
                      page === p ? 'bg-gold text-ebony' : 'border border-cream/70 text-ebony/70 dark:text-cream/70'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-cream/70 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          )}
        </section>

        {/* Foto Saya */}
        <section className="space-y-4">
          <div>
            <p className="text-sm text-gold">{t('dashboard.myPhotos')}</p>
            <h2 className="font-display text-2xl">{t('dashboard.myPhotos')}</h2>
          </div>
          {myPhotos.length ? (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {myPhotos.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-cream/60">
                  <img src={p.url} alt="Foto" className="h-32 w-full object-cover" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ebony/70 dark:text-cream/70">{t('dashboard.photosEmpty')}</p>
          )}
        </section>

        {/* Antrean Foto (inline) */}
        <section className="space-y-4">
          <div>
            <p className="text-sm text-gold">{t('dashboard.photoQueue')}</p>
            <h2 className="font-display text-2xl">{t('dashboard.manageFromDashboard')}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
              value={photoPointId || ''}
              onChange={(e) => setPhotoPointId(Number(e.target.value))}
            >
              {(photoPoints || []).map((p) => (
                <option key={p.id} value={p.id} className="text-ebony">{p.name}</option>
              ))}
            </select>
            <button
              onClick={joinPhotoQueue}
              disabled={!photoPointId || !effectiveOrderCode}
              className="rounded-2xl bg-gold px-4 py-2 text-sm font-semibold text-ebony disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t('dashboard.joinQueue')}
            </button>
            <button onClick={checkPhotoStatus} className="rounded-2xl border px-4 py-2 text-sm">
              {t('dashboard.refreshStatus')}
            </button>
          </div>
          {!photoPoints?.length && (
            <p className="text-xs text-amber-700">Titik foto belum tersedia. Jalankan seeder atau tambah data photo_points.</p>
          )}
          <div className="rounded-2xl border border-cream/60 p-4 text-sm dark:border-white/10">
            {photoStatus?.entry ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold">{t('dashboard.queueNumber')}</p>
                  <p className="text-3xl font-display">#{photoStatus.entry.queue_number}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold">{t('dashboard.position')}</p>
                  <p className="text-3xl font-display">{photoStatus.position ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold">{t('dashboard.status')}</p>
                  <p className="text-base font-semibold capitalize">{photoStatus.entry.status}</p>
                </div>
              </div>
            ) : (
              <p className="text-ebony/70 dark:text-cream/70">Belum dalam antrean. Pilih titik foto lalu klik “Gabung Antrean”.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <QrModal open={Boolean(selectedTickets)} tickets={selectedTickets || []} onClose={() => setSelectedTickets(null)} />
    </div>
  );
};

export default UserDashboard;
