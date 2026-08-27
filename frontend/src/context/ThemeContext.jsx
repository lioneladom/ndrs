import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'ndrs_theme_preference';

/**
 * Hook to use NDRS theme across the app.
 * Automatically respects device default theme and allows manual override.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  // 'system' | 'dark' | 'light'
  const [preference, setPreference] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
    // Also check legacy keys if any
    const legacyAdmin = localStorage.getItem('ndrs_admin_theme');
    if (legacyAdmin === 'dark') return 'dark';
    if (legacyAdmin === 'light') return 'light';
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to device / browser prefers-color-scheme changes
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

  // Compute effective dark mode
  const darkMode = preference === 'system' ? systemIsDark : preference === 'dark';

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

    // Update meta theme-color for mobile browsers
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', darkMode ? '#090d16' : '#f8fafc');

    localStorage.setItem(STORAGE_KEY, preference);
    localStorage.setItem('ndrs_admin_theme', darkMode ? 'dark' : 'light');
  }, [darkMode, preference]);

  const toggleTheme = () => {
    setPreference((prev) => {
      if (prev === 'system') {
        return systemIsDark ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  const setTheme = (theme) => {
    if (theme === 'system' || theme === 'dark' || theme === 'light') {
      setPreference(theme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        isDark: darkMode,
        theme: preference,
        preference,
        setTheme,
        toggleTheme,
        systemIsDark
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
