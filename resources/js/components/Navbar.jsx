import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

const navItems = [
  { href: 'experience', label: 'Pengalaman' },
  { href: 'jadwal', label: 'Jadwal' },
  { href: 'galeri', label: 'Galeri' },
  { href: 'testimoni', label: 'Testimoni' },
  { href: 'lokasi', label: 'Lokasi' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useDarkMode();
  const location = useLocation();
  const [isScrolled, setScrolled] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const primaryLink = user
    ? user.role === 'admin'
      ? { to: '/admin', label: 'Admin' }
      : user.role === 'operator'
      ? { to: '/operator', label: 'Petugas' }
      : { to: '/dashboard', label: 'Dashboard' }
    : null;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const primaryLinkClasses = primaryLink?.to === '/dashboard'
    ? 'rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ebony hover:bg-gold/90'
    : 'rounded-full border border-gold/60 px-4 py-2 text-sm text-gold';

  const closeMobile = () => setMobileOpen(false);

  const scrollToAnchor = (anchor) => {
    if (typeof window === 'undefined' || !anchor) return;
    if (location.pathname === '/') {
      requestAnimationFrame(() => {
        const target = document.getElementById(anchor);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        isScrolled ? 'bg-cream/80 dark:bg-ebony/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl font-semibold text-gold">
          Pura Lempuyang
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={`/#${item.href}`}
              onClick={() => scrollToAnchor(item.href)}
              className="text-ebony/80 transition hover:text-gold dark:text-cream/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="glass-panel flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm font-medium">Halo {user.name.split(' ')[0]}</span>
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/70 text-sm font-semibold"
                >
                  {initials || <UserRound size={16} />}
                </Link>
                {primaryLink && (
                  <NavLink to={primaryLink.to} className={primaryLinkClasses}>
                    {primaryLink.label}
                  </NavLink>
                )}
                <button
                  onClick={() => logout()}
                  className="rounded-full px-4 py-2 text-sm text-ebony/70 dark:text-cream/70"
                >
                  Keluar
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/login" className="text-sm font-medium text-ebony/80 dark:text-cream">
                Masuk
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ebony shadow-glow hover:scale-105"
              >
                Daftar
              </NavLink>
            </div>
          )}

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/60 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden"
          >
            <div className="space-y-6 bg-cream px-6 pb-6 pt-4 text-sm text-ebony dark:bg-ebony dark:text-cream">
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={`/#${item.href}`}
                    onClick={() => {
                      scrollToAnchor(item.href);
                      closeMobile();
                    }}
                    className="text-base font-semibold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-cream/60 pt-4 dark:border-white/10">
                {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  to="/profile"
                  onClick={closeMobile}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cream/70 px-4 py-3"
                >
                  <UserRound size={18} /> Kelola Profil
                </Link>
                    {primaryLink && (
                      <NavLink
                        to={primaryLink.to}
                        onClick={closeMobile}
                        className="rounded-2xl bg-gold px-4 py-3 text-center text-sm font-semibold text-ebony"
                      >
                        {primaryLink.label}
                      </NavLink>
                    )}
                    <button
                      onClick={() => {
                        closeMobile();
                        logout();
                      }}
                      className="rounded-2xl border border-cream/70 px-4 py-3 text-left text-sm"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <NavLink to="/login" onClick={closeMobile} className="rounded-2xl border border-cream/70 px-4 py-3 text-center">
                      Masuk
                    </NavLink>
                    <NavLink to="/register" onClick={closeMobile} className="rounded-2xl bg-gold px-4 py-3 text-center font-semibold text-ebony">
                      Daftar
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
