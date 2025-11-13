import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';
const CREAM = '#FAF9F6';
const LOG_PAGE_SIZE = 5;
const TICKET_PAGE_SIZE = 6;

const mockTickets = [
  { code: 'E651EA9D-BEF3-44CC', name: 'Kadek Laksmi', status: 'pending', slot: '14 Nov 05:30' },
  { code: 'EE1E23C5-1983-47D1', name: 'Nadia Rahmania', status: 'used', slot: '14 Nov 06:00' },
  { code: '4D0D5829-DFC5-49BD', name: 'Clara Widjaja', status: 'pending', slot: '14 Nov 07:30' },
  { code: '10B5470E-1E7C-415B', name: 'John Doe', status: 'used', slot: '13 Nov 16:30' },
  { code: 'C16A0C74-9B92-4236', name: 'Putu Aditya', status: 'pending', slot: '13 Nov 17:00' },
  { code: 'A63D9031-7C45-4FD0', name: 'Surya Villa', status: 'pending', slot: '13 Nov 18:30' },
  { code: 'B21F0C94-CEF7-4402', name: 'Wayan Jati', status: 'used', slot: '12 Nov 05:30' },
];

const initialLogs = [
  { code: 'E651EA9D-BEF3-44CC', time: '14 Nov, 02:19' },
  { code: 'EE1E23C5-1983-47D1', time: '14 Nov, 00:41' },
  { code: '4D0D5829-DFC5-49BD', time: '13 Nov, 23:50' },
  { code: '10B5470E-1E7C-415B', time: '13 Nov, 23:49' },
  { code: 'C16A0C74-9B92-4236', time: '13 Nov, 23:49' },
];

const ValidationDashboard = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [logPage, setLogPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);
  const [manualCode, setManualCode] = useState('');
  const [scanMessage, setScanMessage] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [glow, setGlow] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const beepAudio = useMemo(() => (typeof window !== 'undefined' ? new Audio('/beep.mp3') : null), []);

  const totalLogPages = Math.max(1, Math.ceil(logs.length / LOG_PAGE_SIZE));
  const totalTicketPages = Math.max(1, Math.ceil(mockTickets.length / TICKET_PAGE_SIZE));

  useEffect(() => {
    setLogPage((current) => Math.min(current, totalLogPages));
  }, [totalLogPages]);

  useEffect(() => {
    setTicketPage((current) => Math.min(current, totalTicketPages));
  }, [totalTicketPages]);

  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * LOG_PAGE_SIZE;
    return logs.slice(start, start + LOG_PAGE_SIZE);
  }, [logPage, logs]);

  const paginatedTickets = useMemo(() => {
    const start = (ticketPage - 1) * TICKET_PAGE_SIZE;
    return mockTickets.slice(start, start + TICKET_PAGE_SIZE);
  }, [ticketPage]);

  const pushLog = useCallback((code) => {
    const newEntry = { code, time: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) };
    setLogs((prev) => [newEntry, ...prev]);
  }, []);

  const armBeep = useCallback(async () => {
    if (!beepAudio) return;
    try {
      await beepAudio.play();
      beepAudio.pause();
      beepAudio.currentTime = 0;
      setAudioReady(true);
    } catch (error) {
      console.error(error);
    }
  }, [beepAudio]);

  const handleSuccess = useCallback(
    (code) => {
      if (!code) return;
      setScanError(null);
      setScanMessage('Validasi Berhasil!');
      setGlow(true);
      pushLog(code);
      if (audioReady && beepAudio) {
        beepAudio.currentTime = 0;
        beepAudio.play().catch(() => null);
      }
      const timer = setTimeout(() => {
        setGlow(false);
        setScanMessage(null);
      }, 1200);
      return () => clearTimeout(timer);
    },
    [audioReady, beepAudio, pushLog]
  );

  const handleError = useCallback((err) => {
    setScanError(err?.message || 'QR tidak terbaca, coba lagi.');
    setGlow(false);
  }, []);

  const handleManualSubmit = useCallback(() => {
    const code = manualCode.trim();
    if (!code) return;
    handleSuccess(code);
    setManualCode('');
  }, [handleSuccess, manualCode]);

  const statusColor = (status) => {
    if (status === 'used') return 'bg-slate-100 text-slate-600';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <div className="min-h-screen bg-[var(--cream,#FAF9F6)] px-4 py-10 font-['Poppins'] text-ebony">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="grid gap-6 lg:grid-cols-2">
      <motion.div
        className="glass-panel rounded-3xl bg-white/90 p-6 shadow-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-gold">
              <p>Scan QR</p>
              <span className={glow ? 'text-emerald-500 transition' : 'text-ebony/40'}>
                {glow ? 'Validasi aktif' : 'Ready'}
              </span>
            </div>
            <div className={`mt-4 rounded-[28px] bg-black/15 p-3 ${glow ? 'ring-4 ring-emerald-300/60 duration-300' : ''}`}>
              <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={(result, error) => {
                  if (result?.text) {
                    handleSuccess(result.text);
                  } else if (error) {
                    handleError(error);
                  }
                }}
                containerStyle={{ borderRadius: '22px', overflow: 'hidden' }}
                videoStyle={{ borderRadius: '22px', objectFit: 'cover' }}
                className="h-[360px] w-full rounded-3xl"
              />
            </div>
            {scanMessage && <p className="mt-3 text-sm font-semibold text-emerald-500">{scanMessage}</p>}
            {scanError && <p className="mt-2 text-xs text-red-500">{scanError}</p>}
            <div className="mt-4 flex gap-3">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Masukkan kode manual"
                className="flex-1 rounded-2xl border border-cream/70 bg-white/70 px-4 py-3 text-sm"
              />
              <button
                type="button"
                onClick={handleManualSubmit}
                className="rounded-2xl bg-[var(--gold,#D4AF37)] px-6 py-3 text-sm font-semibold text-ebony shadow-lg"
              >
                Validasi
              </button>
            </div>
            <div className="mt-3 text-xs text-amber-600">
              <button type="button" onClick={armBeep} className="font-semibold text-gold hover:underline">
                Aktifkan suara beep
              </button>
              {!audioReady && <span className="ml-2 text-amber-500">(tap sekali sebelum mulai scan)</span>}
            </div>
          </motion.div>

          <motion.div
            className="glass-panel rounded-3xl bg-white/90 p-6 shadow-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gold">Log Validasi</p>
                <p className="text-xs text-ebony/60">Jejak realtime setiap QR diterima petugas.</p>
              </div>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">{logs.length} entri</span>
            </div>
            <div className="mt-4 space-y-4">
              {paginatedLogs.map((item) => (
                <div key={`${item.code}-${item.time}`} className="rounded-2xl border border-cream/60 px-4 py-3">
                  <p className="font-mono text-sm font-semibold">{item.code}</p>
                  <p className="text-xs text-ebony/60">{item.time}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-ebony/60">
              <button
                type="button"
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                disabled={logPage === 1}
                className="rounded-full border border-cream/80 px-4 py-2 font-semibold disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-gold">{logPage}</span>
              <button
                type="button"
                onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                disabled={logPage === totalLogPages}
                className="rounded-full border border-cream/80 px-4 py-2 font-semibold disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="glass-panel rounded-3xl bg-white/95 p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Daftar Tiket</p>
              <p className="text-xs text-ebony/60">Antrean tiket yang siap dipindai.</p>
            </div>
            <span className="rounded-full bg-gold/10 px-4 py-1 text-xs font-semibold text-gold">{mockTickets.length} tiket</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gold">
                  <th className="pb-2">Kode</th>
                  <th>Pengunjung</th>
                  <th>Status</th>
                  <th>Slot</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket.code} className="border-t border-cream/70 text-sm">
                    <td className="py-3 font-mono text-[13px]">{ticket.code}</td>
                    <td>{ticket.name}</td>
                    <td>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>{ticket.slot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-ebony/60">
            <button
              type="button"
              onClick={() => setTicketPage((p) => Math.max(1, p - 1))}
              disabled={ticketPage === 1}
              className="rounded-full border border-cream/80 px-4 py-2 font-semibold disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="text-gold">Hal {ticketPage}</span>
            <button
              type="button"
              onClick={() => setTicketPage((p) => Math.min(totalTicketPages, p + 1))}
              disabled={ticketPage === totalTicketPages}
              className="rounded-full border border-cream/80 px-4 py-2 font-semibold disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ValidationDashboard;
