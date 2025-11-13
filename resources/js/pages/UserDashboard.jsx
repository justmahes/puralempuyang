import { useMemo, useState } from 'react';
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

const UserDashboard = () => {
  const { token } = useAuth();
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
            toast.error(err.response?.orders?.message || 'Gagal sinkronisasi status pembayaran');
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
      toast.error(error.response?.orders?.message || 'Gagal melanjutkan pembayaran');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-28 pb-20 space-y-10">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Total Pembelian" value={`Rp ${stats.total.toLocaleString('id-ID')}`} icon={CreditCard} />
          <MetricCard title="Tiket Aktif" value={stats.active} icon={TicketCheck} />
          <MetricCard title="Jadwal Mendatang" value={stats.upcoming} icon={Timer} />
        </div>
        <section className="space-y-4">
          <div>
            <p className="text-sm text-gold">Tiket Saya</p>
            <h1 className="font-display text-3xl">Semua Transaksi</h1>
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
              <p className="text-sm text-ebony/70">Belum ada transaksi</p>
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
      </main>
      <Footer />
      <QrModal open={Boolean(selectedTickets)} tickets={selectedTickets || []} onClose={() => setSelectedTickets(null)} />
    </div>
  );
};

export default UserDashboard;







