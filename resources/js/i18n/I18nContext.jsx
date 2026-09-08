import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations } from './translations';

const I18nContext = createContext();

const STORAGE_KEY = 'pl_locale';

// Hanya diisi ketika pengunjung menekan tombol bahasa sendiri. Selama kosong,
// bahasa boleh ditentukan otomatis dari kategori akun.
const storedChoice = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'id' ? stored : null;
  } catch {
    return null;
  }
};

const getInitialLocale = () => storedChoice() || 'id';

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(getInitialLocale);

  const setLanguage = useCallback((next) => {
    const normalized = next === 'en' ? 'en' : 'id';
    setLocale(normalized);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        // Mode privat memblokir penyimpanan; bahasa tetap berlaku untuk sesi ini.
      }
    }
  }, []);

  // Pengunjung mancanegara mendapat bahasa Inggris tanpa perlu menekan apa pun.
  // Pilihan manual selalu menang: begitu tombol bahasa ditekan, pilihan itu
  // tersimpan dan fungsi ini berhenti ikut campur.
  const applyLocaleForVisitor = useCallback((citizenshipType) => {
    if (storedChoice()) return;
    setLocale(citizenshipType === 'international' ? 'en' : 'id');
  }, []);

  const t = useCallback(
    (key, vars) => {
      const dict = translations[locale] || translations.id;
      const parts = key.split('.');
      let value = parts.reduce((acc, part) => (acc && acc[part] != null ? acc[part] : null), dict);
      if (typeof value !== 'string') {
        value = parts.reduce((acc, part) => (acc && acc[part] != null ? acc[part] : null), translations.id);
      }
      if (typeof value !== 'string') return key;
      if (!vars) return value;
      return Object.entries(vars).reduce(
        (out, [k, v]) => out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
        value
      );
    },
    [locale]
  );

  const api = useMemo(
    () => ({ locale, setLanguage, applyLocaleForVisitor, t }),
    [locale, setLanguage, applyLocaleForVisitor, t]
  );

  return <I18nContext.Provider value={api}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

