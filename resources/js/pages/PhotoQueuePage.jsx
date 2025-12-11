import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PhotoQueuePage = () => {
  const { user } = useAuth();
  const { data: points } = useQuery({
    queryKey: ['photo-points'],
    queryFn: async () => (await api.get(endpoints.photoPoints)).data.data || [],
  });
  const [pointId, setPointId] = useState(null);
  useEffect(() => { if (!pointId && points?.length) setPointId(points[0].id); }, [points, pointId]);

  const [status, setStatus] = useState(null);

  const join = async () => {
    try {
      const orderCode = new URLSearchParams(location.search).get('order') || '';
      const { data } = await api.post(endpoints.photoEnqueue, { point_id: pointId, order_code: orderCode });
      toast.success('Masuk antrean');
      await check();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal masuk antrean');
    }
  };

  const check = async () => {
    try {
      const orderCode = new URLSearchParams(location.search).get('order') || '';
      const { data } = await api.get(endpoints.photoStatus, { params: { order_code: orderCode } });
      setStatus(data);
    } catch (e) {
      setStatus(null);
    }
  };

  useEffect(() => { check(); }, []);

  return (
    <div className="min-h-screen bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20 space-y-6">
        <h1 className="font-display text-3xl">Antrean Foto</h1>
        <p className="text-sm text-ebony/70 dark:text-cream/70">Pilih titik foto lalu bergabung antrean. Tunjukkan layar ini saat dipanggil.</p>
        <div className="flex items-center gap-3">
          <select className="rounded-xl border border-cream/60 bg-transparent px-3 py-2" value={pointId || ''} onChange={(e) => setPointId(Number(e.target.value))}>
            {(points || []).map((p) => (
              <option key={p.id} value={p.id} className="text-ebony">{p.name}</option>
            ))}
          </select>
          <button onClick={join} className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ebony">Gabung Antrean</button>
          <button onClick={check} className="rounded-xl border px-4 py-2 text-sm">Refresh</button>
        </div>

        <div className="rounded-2xl border border-cream/60 p-4 dark:border-white/10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Status</p>
          {status?.entry ? (
            <div className="mt-2">
              <p className="text-4xl font-display">#{status.entry.queue_number}</p>
              <p className="text-sm">Posisi: {status.position ?? 0}</p>
              <p className="text-sm">Status: {status.entry.status}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">Belum dalam antrean.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PhotoQueuePage;

