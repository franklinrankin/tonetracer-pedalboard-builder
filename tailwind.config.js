/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'board': {
          'dark': '#FFFEF0',      // Cream background
          'surface': '#FFFFFF',   // White cards
          'elevated': '#F5F5DC',  // Beige
          'border': '#000000',    // Black borders
          'accent': '#FF5722',    // Orange
          'accent-dim': '#E64A19',
          'highlight': '#1E3A5F', // Dark blue
          'success': '#4CAF50',   // Green
          'warning': '#FF9800',   // Orange/Yellow
          'danger': '#F44336',    // Red
          'muted': '#666666',
          'blue': '#2196F3',
          'purple': '#9C27B0',
          'teal': '#009688',
        },
        'pedal': {
          'gain': '#F44336',
          'modulation': '#9C27B0',
          'delay': '#2196F3',
          'reverb': '#009688',
          'dynamics': '#FF9800',
          'filter': '#FFEB3B',
          'pitch': '#E91E63',
          'eq': '#00BCD4',
          'volume': '#607D8B',
          'amp': '#795548',
          'utility': '#9E9E9E',
          'synth': '#673AB7',
        }
      },
      fontFamily: {
        'display': ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['"Space Mono"', '"IBM Plex Mono"', 'monospace'],
        'body': ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px #000000',
        'brutal-sm': '2px 2px 0px #000000',
        'brutal-lg': '8px 8px 0px #000000',
        'brutal-hover': '6px 6px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
    },
  },
  plugins: [],
}
