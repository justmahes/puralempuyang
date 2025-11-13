import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { endpoints, AUTH_LOGOUT_EVENT } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('pl_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pl_token'));
  const [loading, setLoading] = useState(false);

  const resetAuthState = useCallback(() => {
    localStorage.removeItem('pl_token');
    localStorage.removeItem('pl_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleForcedLogout = () => {
      resetAuthState();
      toast.error('Sesi Anda telah berakhir, silakan login kembali.');
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout);
  }, [resetAuthState]);

  const persist = (jwt, profile) => {
    localStorage.setItem('pl_token', jwt);
    localStorage.setItem('pl_user', JSON.stringify(profile));
    setToken(jwt);
    setUser(profile);
  };

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const { data } = await api.get(endpoints.profile);
      if (data.user) {
        persist(token, data.user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await api.post(endpoints.login, credentials);
      persist(data.token, data.user);
      toast.success('Selamat datang kembali!');
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (payload) => {
    try {
      setLoading(true);
      const { data } = await api.post(endpoints.register, payload);
      persist(data.token, data.user);
      toast.success('Akun berhasil dibuat!');
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put(endpoints.profileUpdate, payload);
    if (data.user) {
      localStorage.setItem('pl_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data.user;
  };
  const logout = (options = {}) => {
    resetAuthState();
    if (!options.silent) {
      toast('Sampai jumpa lagi!', { icon: '' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register: registerUser, logout, fetchProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


