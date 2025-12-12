import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations } from './translations';

const I18nContext = createContext();

const getInitialLocale = () => {
  if (typeof window === 'undefined') return 'id';
  const stored = localStorage.getItem('pl_locale');
  return stored === 'en' ? 'en' : 'id';
};

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(getInitialLocale);

  const setLanguage = useCallback((next) => {
    const normalized = next === 'en' ? 'en' : 'id';
    setLocale(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pl_locale', normalized);
    }
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

  const api = useMemo(() => ({ locale, setLanguage, t }), [locale, setLanguage, t]);

  return <I18nContext.Provider value={api}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

