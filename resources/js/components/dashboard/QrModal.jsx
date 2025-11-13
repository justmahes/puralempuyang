import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';

const QrModal = ({ open, onClose, tickets = [] }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ebony/70 dark:text-cream/70">Tiket Digital</p>
              <h3 className="text-xl font-semibold">Scan QR di Gerbang</h3>
            </div>
            <button onClick={onClose} className="text-sm text-ebony/60 dark:text-cream/60">Tutup</button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_code} className="rounded-2xl border border-cream/60 p-4 text-center dark:border-white/10">
                <QRCode value={ticket.ticket_code} size={128} className="mx-auto" />
                <p className="mt-4 text-sm font-semibold">{ticket.ticket_code}</p>
                <p className="text-xs text-ebony/60 dark:text-cream/60">Status: {ticket.status}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default QrModal;
