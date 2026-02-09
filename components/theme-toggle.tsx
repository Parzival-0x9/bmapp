'use client';

import { useTheme } from '@/hooks/use-theme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="btn secondary" onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};
