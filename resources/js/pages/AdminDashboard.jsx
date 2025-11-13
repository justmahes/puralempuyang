import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { endpoints } from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import TrendChart from '../components/dashboard/TrendChart';
import { Banknote, BarChart3, CalendarCog, Trash2, UsersRound } from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_PAGE_SIZE = 8;
const SLOT_LIST_PAGE_SIZE = 5;
const USER_PAGE_SIZE = 6;
const EXCLUDED_CUSTOMER = 'Oka Pradnya';
const SLOT_CATEGORY_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'domestic', label: 'Domestik' },
  { value: 'international', label: 'Mancanegara' },
];

const statusLabels = {
  paid: 'Lunas',
  awaiting_payment: 'Menunggu',
  pending: 'Pending',
  expired: 'Expired',
  cancelled: 'Batal',
};

const statusClasses = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-100',
  awaiting_payment: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-100',
  expired: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100',
  cancelled: 'bg-gray-200 text-gray-700 dark:bg-gray-600/30 dark:text-gray-200',
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { data: overview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.adminOverview);
      return data.data;
    },
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.adminOrders, { params: { exclude_user: EXCLUDED_CUSTOMER } });
      return data.data || [];
    },
  });

  const { data: slotsData } = useQuery({
    queryKey: ['admin-slots'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.adminSlots);
      return data.data || [];
    },
  });

  const { data: ticketTypesData } = useQuery({
    queryKey: ['ticket-types'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.ticketTypes);
      return data.data || [];
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.adminUsers);
      return data.data || [];
    },
  });

  const orders = useMemo(
    () => (ordersData || []).filter((order) => order?.user?.name !== EXCLUDED_CUSTOMER),
    [ordersData]
  );

  const excludedPendingCount = useMemo(
    () =>
      (ordersData || [])
        .filter((order) => order?.user?.name === EXCLUDED_CUSTOMER)
        .filter((order) => ['pending', 'awaiting_payment'].includes(order.status)).length,
    [ordersData]
  );

  const slots = useMemo(() => slotsData || [], [slotsData]);
  const ticketTypes = useMemo(() => ticketTypesData || [], [ticketTypesData]);
  const users = useMemo(() => usersData || [], [usersData]);

  const [slotForm, setSlotForm] = useState({
    ticket_type_id: '',
    visit_date: '',
    start_time: '',
    end_time: '',
    quota_total: 50,
  });
  const [slotCategoryFilter, setSlotCategoryFilter] = useState('all');
  const [operatorForm, setOperatorForm] = useState({ name: '', email: '', password: '' });
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [slotListPage, setSlotListPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    if (!ticketTypes.length) {
      return;
    }

    setSlotForm((prev) => {
      if (prev.ticket_type_id) {
        return prev;
      }
      const fallbackId = ticketTypes[0]?.id;
      return fallbackId ? { ...prev, ticket_type_id: fallbackId.toString() } : prev;
    });
  }, [ticketTypes]);

  const sortedSlots = useMemo(() => {
    if (!slots.length) return [];
    return [...slots].sort((a, b) => {
      const dateDiff = new Date(a.visit_date) - new Date(b.visit_date);
      if (dateDiff !== 0) return dateDiff;
      return (a.start_time || '').localeCompare(b.start_time || '');
    });
  }, [slots]);

  const filteredSlots = useMemo(() => {
    if (!sortedSlots.length || slotCategoryFilter === 'all') {
      return sortedSlots;
    }
    return sortedSlots.filter((slot) => slot.ticket_type?.category === slotCategoryFilter);
  }, [sortedSlots, slotCategoryFilter]);

  const totalSlotPages = Math.max(1, Math.ceil(filteredSlots.length / SLOT_LIST_PAGE_SIZE));
  const totalUserPages = Math.max(1, Math.ceil(users.length / USER_PAGE_SIZE));
  const totalOrderPages = Math.max(1, Math.ceil(orders.length / ORDER_PAGE_SIZE));

  useEffect(() => {
    setOrdersPage((current) => (current > totalOrderPages ? totalOrderPages : current));
  }, [totalOrderPages]);

  useEffect(() => {
    setSlotListPage((current) => (current > totalSlotPages ? totalSlotPages : current));
  }, [totalSlotPages]);

  useEffect(() => {
    setUserPage((current) => (current > totalUserPages ? totalUserPages : current));
  }, [totalUserPages]);

  const paginatedOrders = useMemo(() => {
    if (!orders.length) return [];
    const start = (ordersPage - 1) * ORDER_PAGE_SIZE;
    return orders.slice(start, start + ORDER_PAGE_SIZE);
  }, [orders, ordersPage]);

  const paginatedSlots = useMemo(() => {
    if (!filteredSlots.length) return [];
    const start = (slotListPage - 1) * SLOT_LIST_PAGE_SIZE;
    return filteredSlots.slice(start, start + SLOT_LIST_PAGE_SIZE);
  }, [filteredSlots, slotListPage]);

  const paginatedUsers = useMemo(() => {
    if (!users.length) return [];
    const start = (userPage - 1) * USER_PAGE_SIZE;
    return users.slice(start, start + USER_PAGE_SIZE);
  }, [users, userPage]);

  const resetSlotForm = () => {
    setSlotForm({
      ticket_type_id: ticketTypes[0]?.id?.toString() || '',
      visit_date: '',
      start_time: '',
      end_time: '',
      quota_total: 50,
    });
  };

  const createSlot = async (e) => {
    e.preventDefault();
    const payload = {
      ticket_type_id: Number(slotForm.ticket_type_id),
      visit_date: slotForm.visit_date,
      start_time: slotForm.start_time,
      end_time: slotForm.end_time,
      quota_total: Number(slotForm.quota_total) || 0,
    };

    if (!payload.ticket_type_id) {
      toast.error('Pilih tipe tiket terlebih dahulu');
      return;
    }
    if (!payload.visit_date) {
      toast.error('Tanggal kunjungan wajib diisi');
      return;
    }
    if (!payload.start_time || !payload.end_time) {
      toast.error('Jam mulai dan selesai wajib diisi');
      return;
    }
    if (payload.end_time <= payload.start_time) {
      toast.error('Jam selesai harus lebih besar dari jam mulai');
      return;
    }

    try {
      setIsSavingSlot(true);
      await api.post(endpoints.adminSlot, payload);
      toast.success('Slot ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['admin-slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      resetSlotForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsSavingSlot(false);
    }
  };

  const deleteSlot = async (slotId) => {
    setDeletingSlotId(slotId);
    try {
      await api.delete(endpoints.adminSlot, { data: { id: slotId } });
      toast.success('Slot dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus slot');
    } finally {
      setDeletingSlotId(null);
    }
  };

  const createOperator = async (e) => {
    e.preventDefault();
    try {
      await api.post(endpoints.adminOperators, operatorForm);
      toast.success('Operator baru dibuat');
      setOperatorForm({ name: '', email: '', password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambah operator');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Hapus permanen data pengguna ini?')) {
      return;
    }
    setDeletingUserId(userId);
    try {
      await api.delete(endpoints.adminUsers, { data: { id: userId } });
      toast.success('Pengguna dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
    } finally {
      setDeletingUserId(null);
    }
  };

  const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
  const formatDate = (value) => {
    if (!value) return '-';
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('id-ID');
  };
  const formatSlotDate = (value) => {
    if (!value) return '-';
    const dt = new Date(value);
    return Number.isNaN(dt.getTime())
      ? '-'
      : dt.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  const formatJoinDate = (value) => {
    if (!value) return '-';
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const orderPages = Array.from({ length: totalOrderPages }, (_, idx) => idx + 1);
  const slotPages = Array.from({ length: totalSlotPages }, (_, idx) => idx + 1);
  const userPages = Array.from({ length: totalUserPages }, (_, idx) => idx + 1);

  const sanitizedPending = overview?.pending_orders || 0;

  return (
    <div className="min-h-screen bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-28 pb-20 space-y-10">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard title="Pendapatan" value={formatCurrency(overview?.revenue)} icon={Banknote} />
          <MetricCard title="Tiket Terjual" value={overview?.tickets_sold || 0} icon={UsersRound} />
          <MetricCard title="Pending" value={sanitizedPending} icon={CalendarCog} />
          <MetricCard title="Visitor Logged" value={overview?.visitors || 0} icon={BarChart3} />
        </div>
        <TrendChart data={overview?.trend || []} />

        <section className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={createSlot} className="glass-panel rounded-3xl p-6 space-y-4">
            <div>
              <p className="text-sm text-gold">Tambah Slot</p>
              <h3 className="font-display text-2xl">Jadwal Baru</h3>
            </div>
            <select
              value={slotForm.ticket_type_id}
              onChange={(e) => setSlotForm((s) => ({ ...s, ticket_type_id: e.target.value }))}
              required
              className="w-full rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
            >
              <option value="">Pilih Tipe Tiket</option>
              {ticketTypes.map((ticket) => {
                const label = ticket.category === 'international' ? 'Mancanegara' : 'Domestik';
                return (
                  <option key={ticket.id} value={ticket.id} className="text-ebony">
                    {ticket.name} - {label}
                  </option>
                );
              })}
            </select>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="date"
                value={slotForm.visit_date}
                onChange={(e) => setSlotForm((s) => ({ ...s, visit_date: e.target.value }))}
                required
                className="rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
              />
              <input
                type="number"
                min="1"
                value={slotForm.quota_total}
                onChange={(e) => setSlotForm((s) => ({ ...s, quota_total: Number(e.target.value) }))}
                className="rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="time"
                value={slotForm.start_time}
                onChange={(e) => setSlotForm((s) => ({ ...s, start_time: e.target.value }))}
                required
                className="rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
              />
              <input
                type="time"
                value={slotForm.end_time}
                onChange={(e) => setSlotForm((s) => ({ ...s, end_time: e.target.value }))}
                required
                className="rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={isSavingSlot}
              className="w-full rounded-2xl bg-gold py-3 text-sm font-semibold text-ebony disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingSlot ? 'Menyimpan...' : 'Simpan Slot'}
            </button>
          </form>

          <form onSubmit={createOperator} className="glass-panel rounded-3xl p-6 space-y-4">
            <div>
              <p className="text-sm text-gold">Tim Operasional</p>
              <h3 className="font-display text-2xl">Tambah Petugas</h3>
            </div>
            <input
              value={operatorForm.name}
              onChange={(e) => setOperatorForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Nama"
              className="w-full rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
              required
            />
            <input
              type="email"
              value={operatorForm.email}
              onChange={(e) => setOperatorForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="Email"
              className="w-full rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
              required
            />
            <input
              type="password"
              value={operatorForm.password}
              onChange={(e) => setOperatorForm((s) => ({ ...s, password: e.target.value }))}
              placeholder="Password"
              className="w-full rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
              required
            />
            <button type="submit" className="w-full rounded-2xl border border-gold py-3 text-sm font-semibold text-gold">
              Buat Akun
            </button>
          </form>
        </section>

        <section className="glass-panel rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gold">Kelola Pengguna</p>
              <h3 className="font-display text-2xl">Daftar Wisatawan Terdaftar</h3>
              <p className="text-xs text-ebony/60">Untuk menjaga keakuratan, data ini hanya bisa dilihat atau dihapus.</p>
            </div>
            <span className="rounded-full bg-gold/10 px-4 py-1 text-xs font-semibold text-gold">{users.length} akun</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-ebony/60">
                  <th className="py-2">Nama</th>
                  <th>Email</th>
                  <th>Kategori</th>
                  <th>Order</th>
                  <th>Bergabung</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-cream/70">
                    <td className="py-3 font-semibold">{user.name}</td>
                    <td>{user.email}</td>
                    <td className="capitalize">{user.citizenship_type || '-'}</td>
                    <td>{user.orders_count || 0}</td>
                    <td>{formatJoinDate(user.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => deleteUser(user.id)}
                        disabled={deletingUserId === user.id}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {!paginatedUsers.length && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-ebony/60">
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {users.length > USER_PAGE_SIZE && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]">
              <button
                type="button"
                onClick={() => setUserPage((page) => Math.max(1, page - 1))}
                disabled={userPage === 1}
                className="rounded-full border border-cream/70 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {userPages.map((page) => (
                  <button
                    key={`user-page-${page}`}
                    type="button"
                    onClick={() => setUserPage(page)}
                    className={`h-7 w-7 rounded-full font-semibold ${
                      page === userPage ? 'bg-gold text-ebony' : 'border border-cream/70 text-ebony/70 dark:text-cream/70'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setUserPage((page) => Math.min(totalUserPages, page + 1))}
                disabled={userPage === totalUserPages}
                className="rounded-full border border-cream/70 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          )}
        </section>

        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gold">Slot Kunjungan</p>
              <h3 className="font-display text-2xl">Daftar Jadwal</h3>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            {SLOT_CATEGORY_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSlotCategoryFilter(option.value)}
                className={`rounded-full border px-4 py-1 transition ${
                  slotCategoryFilter === option.value
                    ? 'border-gold bg-gold text-ebony'
                    : 'border-cream/70 text-ebony/70 dark:text-cream/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto">
            {paginatedSlots.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-ebony/50 dark:text-cream/60">
                    <th className="py-2">Tanggal</th>
                    <th>Jam</th>
                    <th>Tipe Tiket</th>
                    <th>Kuota</th>
                    <th>Sisa</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSlots.map((slot) => (
                    <tr key={slot.id} className="border-t border-cream/50 text-sm dark:border-white/5">
                      <td className="py-2 font-semibold">{formatSlotDate(slot.visit_date)}</td>
                      <td>{`${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}`}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold">{slot.ticket_type?.name || '-'}</span>
                          <span className="text-[11px] uppercase tracking-[0.3em] text-ebony/60 dark:text-cream/60">
                            {slot.ticket_type?.category === 'international'
                              ? 'Mancanegara'
                              : slot.ticket_type?.category === 'domestic'
                              ? 'Domestik'
                              : 'Tidak diketahui'}
                          </span>
                        </div>
                      </td>
                      <td>{slot.quota_total}</td>
                      <td>{slot.quota_remaining}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => deleteSlot(slot.id)}
                          disabled={deletingSlotId === slot.id}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-ebony/70 dark:text-cream/70">
                {slotCategoryFilter === 'all'
                  ? 'Belum ada jadwal yang tersedia.'
                  : `Belum ada jadwal untuk kategori ${slotCategoryFilter === 'international' ? 'mancanegara' : 'domestik'}.`}
              </p>
            )}
          </div>
          {filteredSlots.length > SLOT_LIST_PAGE_SIZE && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]">
              <button
                type="button"
                onClick={() => setSlotListPage((page) => Math.max(1, page - 1))}
                disabled={slotListPage === 1}
                className="rounded-full border border-cream/70 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {slotPages.map((page) => (
                  <button
                    key={`slot-page-${page}`}
                    type="button"
                    onClick={() => setSlotListPage(page)}
                    className={`h-7 w-7 rounded-full font-semibold ${
                      page === slotListPage ? 'bg-gold text-ebony' : 'border border-cream/70 text-ebony/70 dark:text-cream/70'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSlotListPage((page) => Math.min(totalSlotPages, page + 1))}
                disabled={slotListPage === totalSlotPages}
                className="rounded-full border border-cream/70 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          )}
        </section>

        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gold">Order Terbaru</p>
              <h3 className="font-display text-2xl">Transaksi Terkini</h3>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            {paginatedOrders.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-ebony/50 dark:text-cream/60">
                    <th className="py-2">No</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Nominal</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order, idx) => (
                    <tr key={order.id} className="border-t border-cream/50 text-sm dark:border-white/5">
                      <td className="py-2">{(ordersPage - 1) * ORDER_PAGE_SIZE + idx + 1}</td>
                      <td className="font-semibold">{order.order_code}</td>
                      <td>{order.user?.name || 'Tidak diketahui'}</td>
                      <td>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClasses[order.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-200'
                        }`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td>{formatCurrency(order.amount)}</td>
                      <td>{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-ebony/70 dark:text-cream/70">Belum ada transaksi.</p>
            )}
          </div>
          {orders.length > ORDER_PAGE_SIZE && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={() => setOrdersPage((page) => Math.max(1, page - 1))}
                disabled={ordersPage === 1}
                className="rounded-full border border-cream/70 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <div className="flex flex-wrap gap-1">
                {orderPages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setOrdersPage(page)}
                    className={`h-8 w-8 rounded-full text-xs font-semibold ${
                      page === ordersPage ? 'bg-gold text-ebony' : 'border border-cream/70 text-ebony/70 dark:text-cream/70'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOrdersPage((page) => Math.min(totalOrderPages, page + 1))}
                disabled={ordersPage === totalOrderPages}
                className="rounded-full border border-cream/70 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

