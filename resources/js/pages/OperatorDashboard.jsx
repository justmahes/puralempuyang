import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { endpoints } from '../services/api';
import { saveSnapshot, getSnapshot, getSnapshotTicket, queueValidation, getQueuedValidations, clearQueuedValidations, markLocalUsed, isLocallyUsed } from '../services/idb';
import MetricCard from '../components/dashboard/MetricCard';
import OperatorScanner from '../components/dashboard/OperatorScanner';
import toast from 'react-hot-toast';
import PhotoQueuePanel from '../components/operator/PhotoQueuePanel';
import { ShieldCheck, Ticket, UserCheck, AlertTriangle, Globe } from 'lucide-react';

const TICKET_PAGE_SIZE = 8;
const LOG_PAGE_SIZE = 5;

const formatRupiah = (value) =>
  typeof value === 'number' || (value && !Number.isNaN(Number(value)))
    ? `Rp${Number(value).toLocaleString('id-ID')}`
    : '-';

// Bentuk hasil scan offline dari snapshot lokal, supaya petugas tetap
// melihat kategori tiket walau tidak ada koneksi.
const buildOfflineScan = (code, snapshotTicket) => {
  const category = snapshotTicket?.category || null;
  return {
    state: 'offline',
    ticket_code: code,
    order_code: snapshotTicket?.order_code,
    visitor_name: snapshotTicket?.customer,
    citizenship_type: snapshotTicket?.citizenship_type,
    category,
    category_label:
      category === 'international' ? 'Mancanegara (WNA)' : category === 'domestic' ? 'Domestik (WNI)' : null,
    ticket_name: snapshotTicket?.ticket_name,
    price: snapshotTicket?.price,
    quantity: snapshotTicket?.quantity,
    visit_date: snapshotTicket?.visit_date,
    start_time: snapshotTicket?.start_time,
    requires_id_check: category === 'domestic',
    id_check_hint:
      category === 'domestic'
        ? 'Tarif domestik. Cocokkan KTP/identitas WNI sebelum meloloskan pengunjung.'
        : category === 'international'
          ? 'Tarif mancanegara. Tidak ada selisih harga yang perlu diperiksa.'
          : 'Data tiket belum ada di snapshot offline. Verifikasi manual saat kembali online.',
  };
};

const OperatorDashboard = () => {
  const queryClient = useQueryClient();
  const { data: stats } = useQuery({
    queryKey: ['operator-stats'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.operatorStats);
      return data.data;
    },
  });

  const { data: tickets } = useQuery({
    queryKey: ['operator-tickets'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.operatorTickets);
      return data.data || [];
    },
  });

  const [ticketPage, setTicketPage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  const ticketsList = tickets || [];
  const [offlineTickets, setOfflineTickets] = useState([]);
  const recentLogs = stats?.recent || [];

  const totalTicketPages = Math.max(1, Math.ceil(ticketsList.length / TICKET_PAGE_SIZE));
  const totalLogPages = Math.max(1, Math.ceil(recentLogs.length / LOG_PAGE_SIZE));

  useEffect(() => {
    setTicketPage((current) => (current > totalTicketPages ? totalTicketPages : current));
  }, [totalTicketPages]);

  useEffect(() => {
    setLogPage((current) => (current > totalLogPages ? totalLogPages : current));
  }, [totalLogPages]);

  // Load snapshot when offline or request fails
  useEffect(() => {
    const loadSnapshot = async () => {
      try {
        if (!navigator.onLine) {
          const snap = await getSnapshot();
          setOfflineTickets(snap.items || []);
        } else {
          // Save snapshot when online for future offline use
          if (ticketsList.length) {
            await saveSnapshot(ticketsList, { generated_at: new Date().toISOString() });
          }
        }
      } catch (e) {
        // ignore
      }
    };
    loadSnapshot();
  }, [ticketsList]);

  const ticketPages = useMemo(() => Array.from({ length: totalTicketPages }, (_, idx) => idx + 1), [totalTicketPages]);
  const logPages = useMemo(() => Array.from({ length: totalLogPages }, (_, idx) => idx + 1), [totalLogPages]);

  const effectiveTickets = navigator.onLine ? ticketsList : (offlineTickets || []);
  const paginatedTickets = useMemo(() => {
    const start = (ticketPage - 1) * TICKET_PAGE_SIZE;
    return effectiveTickets.slice(start, start + TICKET_PAGE_SIZE);
  }, [effectiveTickets, ticketPage]);

  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * LOG_PAGE_SIZE;
    return recentLogs.slice(start, start + LOG_PAGE_SIZE);
  }, [recentLogs, logPage]);

  const formatTimestamp = (value) => {
    if (!value) return '-';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const beepAudioRef = useRef(typeof Audio !== 'undefined' ? new Audio('/beep.mp3') : null);
  const [audioReady, setAudioReady] = useState(false);
  const [beepInfo, setBeepInfo] = useState('');

  const armBeep = useCallback(async () => {
    const audio = beepAudioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      setAudioReady(true);
      setBeepInfo('Suara aktif, siap memindai.');
    } catch (error) {
      setBeepInfo('Browser memblokir audio, coba lagi.');
    }
  }, []);

  const playBeep = useCallback(() => {
    if (!audioReady) return;
    const audio = beepAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => null);
  }, [audioReady]);

  const [scan, setScan] = useState(null);

  const mutation = useMutation({
    mutationFn: async (ticket_code) => {
      const { data } = await api.post(endpoints.operatorValidate, { ticket_code });
      return data;
    },
    onSuccess: (data) => {
      setScan({ ...(data.verification || {}), state: 'valid' });
      toast.success('Tiket valid!');
      playBeep();
      queryClient.invalidateQueries({ queryKey: ['operator-stats'] });
      queryClient.invalidateQueries({ queryKey: ['operator-tickets'] });
    },
    onError: async (error, variables) => {
      const offline = !navigator.onLine || !error?.response;
      if (offline) {
        const snapshotTicket = await getSnapshotTicket(variables);
        setScan(buildOfflineScan(variables, snapshotTicket));
        await queueValidation(variables);
        await markLocalUsed(variables);
        playBeep();
        toast('Offline: tiket di-antri sinkron');
      } else {
        const payload = error.response?.data;
        setScan({
          ...(payload?.verification || { ticket_code: variables }),
          state: 'rejected',
          reason: payload?.message,
        });
        toast.error(payload?.message || 'Validasi gagal');
      }
    },
  });

  return (
    <div className="min-h-screen bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-28 pb-20 space-y-10">
        {/* Offline indicator + Sync */}
        <div className="flex items-center justify-between rounded-2xl border border-cream/60 p-3 text-xs dark:border-white/10">
          <span className={navigator.onLine ? 'text-green-600' : 'text-amber-600'}>
            {navigator.onLine ? 'ONLINE' : 'OFFLINE (scan tetap bisa, sinkron saat online)'}
          </span>
          <button
            type="button"
            className="rounded-full border border-cream/60 px-3 py-1 dark:border-white/20"
            onClick={async () => {
              try {
                // Pull fresh snapshot when online
                if (navigator.onLine) {
                  const { data } = await api.get(endpoints.operatorTickets);
                  await saveSnapshot(data.data || [], { generated_at: new Date().toISOString() });
                  toast.success('Snapshot diperbarui');
                }
                const pending = await getQueuedValidations();
                if (pending.length && navigator.onLine) {
                  await api.post(endpoints.operatorValidate + '/batch', { items: pending });
                  await clearQueuedValidations();
                  toast.success('Sinkronisasi sukses');
                  queryClient.invalidateQueries({ queryKey: ['operator-tickets'] });
                  queryClient.invalidateQueries({ queryKey: ['operator-stats'] });
                } else if (!pending.length) {
                  toast('Tidak ada data untuk sinkron');
                }
              } catch (e) {
                toast.error('Gagal sinkron');
              }
            }}
          >
            Sinkronkan
          </button>
        </div>
        {/* ======= STAT CARD ======= */}
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard title="Validasi Hari Ini" value={stats?.validated_today || 0} icon={ShieldCheck} />
          <MetricCard title="Total Tiket" value={ticketsList.length || 0} icon={Ticket} />
        </div>

        {/* ======= SCANNER + LOG ======= */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
          {/* KIRI - QR Scanner */}
          <div className="space-y-3">
            <OperatorScanner onResult={(code) => mutation.mutate(code)} />
            <div className="flex flex-wrap items-center gap-3 text-xs text-amber-700">
              <button
                type="button"
                onClick={armBeep}
                className="font-semibold text-gold underline-offset-2 hover:underline"
              >
                Aktifkan suara beep
              </button>
              {!audioReady && <span>Tekan sekali sebelum memindai.</span>}
              {beepInfo && (
                <span className={audioReady ? 'text-emerald-600' : 'text-red-500'}>{beepInfo}</span>
              )}
            </div>

            {/* ======= HASIL PEMINDAIAN + VERIFIKASI IDENTITAS ======= */}
            {scan ? (
              <div className="glass-panel rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gold">Hasil Pemindaian</p>
                    <p className="font-mono text-[13px] text-ebony/70 dark:text-cream/70">{scan.ticket_code}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                      scan.state === 'valid'
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : scan.state === 'offline'
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-red-500/15 text-red-600'
                    }`}
                  >
                    {scan.state === 'valid' ? 'Valid' : scan.state === 'offline' ? 'Offline' : 'Ditolak'}
                  </span>
                </div>

                {scan.reason && <p className="text-sm font-semibold text-red-600">{scan.reason}</p>}

                {/* Kategori harga — inti verifikasi di gerbang */}
                {scan.category ? (
                  <div
                    className={`rounded-2xl border p-4 ${
                      scan.requires_id_check
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-sky-500/40 bg-sky-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {scan.requires_id_check ? (
                        <UserCheck className="h-5 w-5 text-amber-600" />
                      ) : (
                        <Globe className="h-5 w-5 text-sky-600" />
                      )}
                      <span
                        className={`text-lg font-bold ${
                          scan.requires_id_check ? 'text-amber-700' : 'text-sky-700'
                        }`}
                      >
                        {scan.category_label}
                      </span>
                      <span className="ml-auto text-sm font-semibold text-ebony/70 dark:text-cream/70">
                        {formatRupiah(scan.price)}
                      </span>
                    </div>
                    {scan.requires_id_check && (
                      <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-amber-700">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        {scan.id_check_hint}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-amber-500/40 px-4 py-3 text-xs text-amber-700">
                    {scan.id_check_hint}
                  </p>
                )}

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-ebony/60 dark:text-cream/60">Pemesan</dt>
                    <dd className="font-semibold">{scan.visitor_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ebony/60 dark:text-cream/60">Kode Order</dt>
                    <dd className="font-mono text-[13px]">{scan.order_code || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ebony/60 dark:text-cream/60">Jenis Tiket</dt>
                    <dd className="font-semibold">{scan.ticket_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ebony/60 dark:text-cream/60">Jumlah dalam Order</dt>
                    <dd className="font-semibold">{scan.quantity ? `${scan.quantity} tiket` : '-'}</dd>
                  </div>
                </dl>

                {scan.quantity > 1 && scan.requires_id_check && (
                  <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-700">
                    Order rombongan ({scan.quantity} tiket) dengan tarif domestik. Periksa identitas tiap
                    pengunjung, bukan hanya pemesan.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setScan(null)}
                  className="w-full rounded-full border border-cream/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] dark:border-white/20"
                >
                  Bersihkan
                </button>
              </div>
            ) : (
              <p className="rounded-3xl border border-dashed border-cream/60 px-4 py-6 text-center text-xs text-ebony/60 dark:border-white/15 dark:text-cream/60">
                Pindai QR untuk melihat kategori tiket dan data pengunjung.
              </p>
            )}
          </div>

          {/* KANAN - Log Validasi */}
          <div className="glass-panel rounded-3xl p-5 max-h-[480px] flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gold">Log Validasi</p>
                  <p className="text-xs text-ebony/60 dark:text-cream/60">
                    Jejak realtime setiap QR diterima petugas.
                  </p>
                </div>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                  {recentLogs.length} entri
                </span>
              </div>

              {/* List log scrollable */}
              <div className="mt-4 space-y-3 text-sm overflow-y-auto max-h-[310px] pr-1 scrollbar-thin scrollbar-thumb-gold/40 scrollbar-track-transparent">
                {paginatedLogs.length ? (
                  paginatedLogs.map((item) => (
                    <div
                      key={`${item.ticket_code}-${item.validated_at}`}
                      className="rounded-2xl border border-cream/60 px-4 py-3 dark:border-white/10"
                    >
                      <p className="font-semibold">{item.ticket_code}</p>
                      <p className="text-xs text-ebony/60 dark:text-cream/60">
                        {formatTimestamp(item.validated_at)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-cream/60 px-4 py-3 text-xs text-ebony/60 dark:border-white/15 dark:text-cream/60">
                    Belum ada tiket yang tervalidasi hari ini.
                  </p>
                )}
              </div>
            </div>

            {/* Pagination */}
            {recentLogs.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.3em]">
                <button
                  type="button"
                  onClick={() => setLogPage((page) => Math.max(1, page - 1))}
                  disabled={logPage === 1}
                  className="rounded-full border border-cream/60 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {logPages.map((page) => (
                    <button
                      key={`log-${page}`}
                      type="button"
                      onClick={() => setLogPage(page)}
                      className={`h-7 w-7 rounded-full font-semibold ${
                        page === logPage
                          ? 'bg-gold text-ebony'
                          : 'border border-cream/60 text-ebony/70 dark:text-cream/70'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setLogPage((page) => Math.min(totalLogPages, page + 1))}
                  disabled={logPage === totalLogPages}
                  className="rounded-full border border-cream/60 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ======= DAFTAR TIKET ======= */}
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gold">Daftar Tiket</p>
              <h3 className="font-display text-2xl">Antrean yang siap dipindai</h3>
            </div>
            <span className="rounded-full bg-cream/60 px-4 py-1 text-xs font-semibold text-ebony/70 dark:bg-white/10 dark:text-cream/80">
              {ticketsList.length} tiket
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-ebony/50 dark:text-cream/60">
                  <th className="py-2">Kode</th>
                  <th>Pengunjung</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Slot</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.length ? (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket.ticket_code} className="border-t border-cream/50 text-sm dark:border-white/5">
                      <td className="py-2 font-semibold">{ticket.ticket_code}</td>
                      <td>{ticket.customer || 'Tidak diketahui'}</td>
                      <td>
                        {ticket.category ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              ticket.category === 'domestic'
                                ? 'bg-amber-500/15 text-amber-700'
                                : 'bg-sky-500/15 text-sky-700'
                            }`}
                          >
                            {ticket.category === 'domestic' ? 'WNI' : 'WNA'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="capitalize">{ticket.status}</td>
                      <td>
                        {ticket.visit_date} {ticket.start_time?.slice(0, 5)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-ebony/60 dark:text-cream/60">
                      Belum ada tiket pada daftar ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bawah */}
          {ticketsList.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]">
              <button
                type="button"
                onClick={() => setTicketPage((page) => Math.max(1, page - 1))}
                disabled={ticketPage === 1}
                className="rounded-full border border-cream/60 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>

              <div className="flex flex-wrap gap-1 text-[10px]">
                {ticketPages.map((page) => (
                  <button
                    key={`ticket-${page}`}
                    type="button"
                    onClick={() => setTicketPage(page)}
                    className={`h-8 w-8 rounded-full font-semibold ${
                      page === ticketPage
                        ? 'bg-gold text-ebony'
                        : 'border border-cream/60 text-ebony/70 dark:text-cream/70'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setTicketPage((page) => Math.min(totalTicketPages, page + 1))}
                disabled={ticketPage === totalTicketPages}
                className="rounded-full border border-cream/60 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          )}
        </section>

        {/* ======= ANTREAN FOTO ======= */}
        <PhotoQueuePanel />
      </main>
      <Footer />
    </div>
  );
};

export default OperatorDashboard;
