import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu as HeadlessMenu } from '@headlessui/react';
import { LayoutDashboard, LogOut, Menu as MenuIcon, Moon, Sun, UserRound, UserCog, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { useI18n } from '../i18n/I18nContext';

const navItems = [
  { href: 'experience', key: 'nav.experience' },
  { href: 'jadwal', key: 'nav.schedule' },
  { href: 'galeri', key: 'nav.gallery' },
  { href: 'testimoni', key: 'nav.testimonials' },
  { href: 'lokasi', key: 'nav.location' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useDarkMode();
  const { locale, setLanguage, t } = useI18n();
  const location = useLocation();
  const [isScrolled, setScrolled] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const primaryLink = user
    ? user.role === 'admin'
      ? { to: '/admin', label: t('nav.admin') }
      : user.role === 'operator'
      ? { to: '/operator', label: t('nav.operator') }
      : { to: '/dashboard', label: t('nav.dashboard') }
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
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link to="/" className="font-display text-2xl font-semibold text-gold flex-none">
          Pura Lempuyang
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:gap-6 text-sm font-medium md:flex whitespace-nowrap overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={`/#${item.href}`}
              onClick={() => scrollToAnchor(item.href)}
              className="text-ebony/80 transition hover:text-gold dark:text-cream/80"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2 lg:gap-3">
          <button
            onClick={() => setLanguage(locale === 'id' ? 'en' : 'id')}
            className="glass-panel flex h-10 px-3 items-center justify-center rounded-full text-xs font-semibold"
            aria-label="Toggle language"
            type="button"
          >
            {locale === 'id' ? 'EN' : 'ID'}
          </button>
          <button
            onClick={toggleDark}
            className="glass-panel flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="hidden lg:inline text-sm font-medium">Halo {user.name.split(' ')[0]}</span>
              <HeadlessMenu as="div" className="relative">
                <HeadlessMenu.Button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/70 text-sm font-semibold hover:bg-cream/40 dark:border-white/20 dark:hover:bg-white/10"
                  aria-label="Open profile menu"
                >
                  {initials || <UserRound size={16} />}
                </HeadlessMenu.Button>
                <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-cream/60 bg-white p-2 text-sm shadow-xl focus:outline-none dark:border-white/10 dark:bg-ebony">
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <NavLink
                        to="/profile"
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 ${active ? 'bg-cream/60 dark:bg-white/10' : ''}`}
                      >
                        <UserCog size={16} className="text-gold" />
                        {t('nav.profile')}
                      </NavLink>
                    )}
                  </HeadlessMenu.Item>
                  {primaryLink && (
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <NavLink
                          to={primaryLink.to}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 ${active ? 'bg-cream/60 dark:bg-white/10' : ''}`}
                        >
                          <LayoutDashboard size={16} className="text-gold" />
                          {primaryLink.label}
                        </NavLink>
                      )}
                    </HeadlessMenu.Item>
                  )}
                  <div className="my-1 border-t border-cream/50 dark:border-white/10" />
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => logout()}
                        className={`w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 ${active ? 'bg-cream/60 dark:bg-white/10' : ''}`}
                      >
                        <LogOut size={16} className="text-gold" />
                        {t('nav.logout')}
                      </button>
                    )}
                  </HeadlessMenu.Item>
                </HeadlessMenu.Items>
              </HeadlessMenu>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/login" className="text-sm font-medium text-ebony/80 dark:text-cream">
                {t('nav.login')}
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ebony shadow-glow hover:scale-105"
              >
                {t('nav.register')}
              </NavLink>
            </div>
          )}

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/60 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isMobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
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
                    key={item.key}
                    to={`/#${item.href}`}
                    onClick={() => {
                      scrollToAnchor(item.href);
                      closeMobile();
                    }}
                    className="text-base font-semibold"
                  >
                    {t(item.key)}
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
                  <UserRound size={18} /> {t('nav.profile')}
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
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <NavLink to="/login" onClick={closeMobile} className="rounded-2xl border border-cream/70 px-4 py-3 text-center">
                      {t('nav.login')}
                    </NavLink>
                    <NavLink to="/register" onClick={closeMobile} className="rounded-2xl bg-gold px-4 py-3 text-center font-semibold text-ebony">
                      {t('nav.register')}
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
