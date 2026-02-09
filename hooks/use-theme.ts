'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('bmapp-theme') as Theme | null;
    const resolved = stored ?? 'dark';
    setTheme(resolved);
    document.documentElement.dataset.theme = resolved;
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      window.localStorage.setItem('bmapp-theme', next);
      return next;
    });
  };

  return { theme, toggleTheme };
};
