import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthPage = ({ mode = 'login' }) => {
  const { register: registerUser, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({
    defaultValues: {
      citizenship_type: 'domestic',
    },
  });
  const isRegister = mode === 'register';
  const redirectFrom = location.state?.from?.pathname;

  const roleDefaults = {
    admin: '/admin',
    operator: '/operator',
    user: '/dashboard',
  };

  const roleAccessMap = {
    admin: ['/admin', '/operator', '/profile', '/booking', '/'],
    operator: ['/operator', '/profile'],
    user: ['/dashboard', '/profile', '/booking', '/'],
  };

  const canAccess = (role, path) => {
    if (!role || !path) return false;
    const allowed = roleAccessMap[role] || [];
    return allowed.some((allowedPath) => path.startsWith(allowedPath));
  };

  const resolveRedirect = (role) => {
    if (
      redirectFrom &&
      !['/login', '/register'].includes(redirectFrom) &&
      canAccess(role, redirectFrom)
    ) {
      return redirectFrom;
    }
    return roleDefaults[role] || '/dashboard';
  };

  const onSubmit = async (values) => {
    try {
      const profile = isRegister ? await registerUser(values) : await login(values);
      if (profile) {
        navigate(resolveRedirect(profile.role), { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel w-full max-w-md rounded-3xl border border-cream/60 bg-white/95 px-8 py-10 shadow-2xl dark:border-white/10 dark:bg-ebony/90"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-gold">{isRegister ? 'Bergabung' : 'Selamat Datang'}</p>
          <h1 className="mt-2 font-display text-3xl">
            {isRegister ? 'Daftar Akun Baru' : 'Masuk ke Akun Anda'}
          </h1>
          <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {isRegister && (
              <div>
                <label className="text-xs font-semibold">Nama Lengkap</label>
                <input {...form.register('name', { required: true })} className="mt-2 w-full rounded-2xl border border-cream/60 bg-transparent px-3 py-2" />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold">Email</label>
              <input type="email" {...form.register('email', { required: true })} className="mt-2 w-full rounded-2xl border border-cream/60 bg-transparent px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-semibold">Password</label>
              <input type="password" {...form.register('password', { required: true })} className="mt-2 w-full rounded-2xl border border-cream/60 bg-transparent px-3 py-2" />
            </div>
            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-semibold">Nomor WhatsApp</label>
                  <input {...form.register('phone')} className="mt-2 w-full rounded-2xl border border-cream/60 bg-white text-ebony dark:border-white/20 dark:bg-ebony/60 dark:text-cream px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-semibold">Jenis Pengunjung</label>
                  <select
                    {...form.register('citizenship_type', { required: true })}
                    className="mt-2 w-full rounded-2xl border border-cream/60 bg-white text-ebony dark:border-white/20 dark:bg-ebony/60 dark:text-cream px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/60 appearance-none"
                  >
                    <option value='domestic'>Wisatawan Domestik (WNI)</option>
                    <option value='international'>Wisatawan Mancanegara</option>
                  </select>
                </div>
              </>
            )}
            <button type="submit" className="w-full rounded-2xl bg-gold py-3 text-sm font-semibold text-ebony">
              {isRegister ? 'Daftar' : 'Masuk'}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-ebony/70 dark:text-cream/70">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="text-gold">
              {isRegister ? 'Masuk' : 'Daftar'}
            </Link>
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;

