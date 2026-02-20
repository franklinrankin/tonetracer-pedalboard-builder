import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 ${className}`}
      style={{
        background: 'var(--color-board-surface)',
        border: '3px solid var(--color-board-border)',
        boxShadow: '2px 2px 0px var(--color-board-shadow)',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" style={{ color: 'var(--color-board-text)' }} />
      ) : (
        <Sun className="w-5 h-5" style={{ color: 'var(--color-board-text)' }} />
      )}
    </button>
  );
}
