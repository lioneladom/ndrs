import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = false, className = '', style = {} }) {
  const { darkMode, preference, toggleTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={
        preference === 'system'
          ? `Theme: System (${darkMode ? 'Dark' : 'Light'}) - Click to toggle`
          : `Theme: ${darkMode ? 'Dark' : 'Light'} - Click to toggle`
      }
      aria-label="Toggle dark / light theme"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 40,
        padding: showLabel ? '0 14px' : '0 10px',
        minWidth: 40,
        borderRadius: 12,
        border: '1px solid var(--ndrs-border)',
        backgroundColor: 'var(--ndrs-surface)',
        color: 'var(--ndrs-ink)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--ndrs-shadow-sm)',
        fontSize: 14,
        fontWeight: 600,
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--ndrs-blue)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--ndrs-border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {darkMode ? (
        <Sun size={18} style={{ color: '#fbbf24' }} />
      ) : (
        <Moon size={18} style={{ color: '#174ea6' }} />
      )}
      {showLabel && (
        <span>{darkMode ? 'Light' : 'Dark'}</span>
      )}
    </button>
  );
}
