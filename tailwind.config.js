/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'board': {
          'dark': '#0a0a0f',
          'surface': '#12121a',
          'elevated': '#1a1a25',
          'border': '#2a2a3a',
          'accent': '#ff6b35',
          'accent-dim': '#cc5529',
          'highlight': '#ffd23f',
          'success': '#4ecdc4',
          'warning': '#ffe66d',
          'danger': '#ff6b6b',
          'muted': '#6b7280',
        },
        'pedal': {
          'gain': '#ff4444',
          'modulation': '#9b59b6',
          'delay': '#3498db',
          'reverb': '#1abc9c',
          'dynamics': '#e67e22',
          'filter': '#f1c40f',
          'pitch': '#e91e63',
          'eq': '#00bcd4',
          'volume': '#607d8b',
          'amp': '#795548',
          'utility': '#9e9e9e',
          'synth': '#673ab7',
        }
      },
      fontFamily: {
        'display': ['Instrument Sans', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,107,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.03) 1px, transparent 1px)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

