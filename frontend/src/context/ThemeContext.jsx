import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'ndrs_theme_mode';

/**
 * Hook to use NDRS theme across the app.
 * Follows device default theme and supports manual user toggle.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [themeMode, setThemeMode] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'dark' || saved === 'light') return saved;
    return 'system';
  });

  // Listen to device default theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    setSystemIsDark(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const darkMode = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  // Apply dark mode class and data-theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    // Update meta theme-color for mobile browser address bars
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', darkMode ? '#090d16' : '#f8fafc');
  }, [darkMode]);

  const toggleTheme = () => {
    const nextMode = darkMode ? 'light' : 'dark';
    setThemeMode(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
  };

  const setManualTheme = (mode) => {
    setThemeMode(mode);
    if (mode === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        isDark: darkMode,
        theme: darkMode ? 'dark' : 'light',
        themeMode,
        toggleTheme,
        setManualTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
