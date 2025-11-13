import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pl_theme';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem(STORAGE_KEY) === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggleDark: () => setIsDark((prev) => !prev) };
};
