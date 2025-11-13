import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const isCitizenshipLocked = Boolean(user?.citizenship_type);
  const lockedCitizenshipLabel =
    user?.citizenship_type === 'international'
      ? 'Wisatawan Mancanegara'
      : 'Wisatawan Domestik (WNI)';
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      citizenship_type: user?.citizenship_type || 'domestic',
    },
  });
  const passwordForm = useForm({
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  useEffect(() => {
    profileForm.reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      citizenship_type: user?.citizenship_type || 'domestic',
    });
  }, [user, profileForm]);

  const handleProfileSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        phone: values.phone,
      };
      if (!isCitizenshipLocked) {
        payload.citizenship_type = values.citizenship_type;
      }
      await updateProfile(payload);
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    }
  };

  const handlePasswordSubmit = async (values) => {
    const payload = {
      current_password: values.current_password,
      password: values.password,
      password_confirmation: values.password_confirmation,
    };
    try {
      await updateProfile(payload);
      passwordForm.reset();
      toast.success('Password berhasil diganti');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengganti password');
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-28 pb-20 space-y-10">
        <section className="glass-panel rounded-3xl p-6">
          <div className="mb-6">
            <p className="text-sm text-gold">Profil</p>
            <h1 className="font-display text-3xl">Kelola Informasi Akun</h1>
            <p className="text-sm text-ebony/70 dark:text-cream/70">Perbarui data kontak dan status pengunjung agar harga tiket otomatis menyesuaikan.</p>
          </div>
          <form className="space-y-4" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <div>
              <label className="text-xs font-semibold">Nama</label>
              <input
                className="mt-2 w-full rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
                {...profileForm.register('name', { required: true })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Email</label>
              <input
                className="mt-2 w-full cursor-not-allowed rounded-2xl border border-cream/70 bg-cream/40 px-3 py-2 text-ebony/60 dark:bg-white/5 dark:text-cream/60"
                value={user?.email || ''}
                readOnly
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Nomor WhatsApp</label>
              <input
                className="mt-2 w-full rounded-2xl border border-cream/70 bg-white text-ebony dark:border-white/20 dark:bg-ebony/60 dark:text-cream px-3 py-2"
                {...profileForm.register('phone')}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Jenis Pengunjung</label>
              {isCitizenshipLocked ? (
                <>
                  <div className="mt-2 rounded-2xl border border-dashed border-cream/70 bg-white px-3 py-2 text-sm font-semibold text-ebony dark:border-white/20 dark:bg-ebony/60 dark:text-cream">
                    {lockedCitizenshipLabel}
                  </div>
                  <input
                    type="hidden"
                    value={user?.citizenship_type || 'domestic'}
                    readOnly
                    {...profileForm.register('citizenship_type')}
                  />
                  <p className="mt-1 text-[11px] text-ebony/60 dark:text-cream/60">Jenis pengunjung dikunci sesuai data pendaftaran. Hubungi admin bila ada kesalahan.</p>
                </>
              ) : (
                <>
                  <select
                    className="mt-2 w-full rounded-2xl border border-cream/70 bg-white text-ebony dark:border-white/20 dark:bg-ebony/60 dark:text-cream px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/60 appearance-none"
                    {...profileForm.register('citizenship_type', { required: true })}
                  >
                    <option value="domestic">Wisatawan Domestik (WNI)</option>
                    <option value="international">Wisatawan Mancanegara</option>
                  </select>
                  <p className="mt-1 text-[11px] text-ebony/60 dark:text-cream/60">Harga tiket akan mengikuti pilihan ini.</p>
                </>
              )}
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-gold px-6 py-3 text-sm font-semibold text-ebony"
            >
              Simpan Profil
            </button>
          </form>
        </section>

        <section className="glass-panel rounded-3xl p-6">
          <div className="mb-6">
            <p className="text-sm text-gold">Keamanan</p>
            <h2 className="font-display text-2xl">Ganti Password</h2>
            <p className="text-sm text-ebony/70 dark:text-cream/70">Gunakan password yang kuat untuk menjaga tiket digital Anda.</p>
          </div>
          <form className="space-y-4" onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <div>
              <label className="text-xs font-semibold">Password Lama</label>
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
                {...passwordForm.register('current_password', { required: true })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Password Baru</label>
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
                {...passwordForm.register('password', { required: true, minLength: 8 })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Konfirmasi Password Baru</label>
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-cream/70 bg-transparent px-3 py-2"
                {...passwordForm.register('password_confirmation', { required: true })}
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl border border-gold px-6 py-3 text-sm font-semibold text-gold"
            >
              Simpan Password
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;