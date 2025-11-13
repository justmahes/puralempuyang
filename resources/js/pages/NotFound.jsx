import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-cream text-center text-ebony dark:bg-ebony dark:text-cream">
    <p className="text-sm uppercase tracking-[0.5em] text-gold">404</p>
    <h1 className="mt-4 font-display text-4xl">Halaman tidak ditemukan</h1>
    <p className="mt-2 text-sm text-ebony/70 dark:text-cream/70">Mari kembali menikmati keindahan Pura Lempuyang.</p>
    <Link to="/" className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ebony">Kembali ke Beranda</Link>
  </div>
);

export default NotFound;
