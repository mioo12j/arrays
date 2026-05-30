import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Resolve content globs relative to THIS config file, not the current working
// directory. Tailwind otherwise resolves them against process.cwd(), so running
// Vite from a parent dir (e.g. the monorepo root) would purge every class.
// Forward slashes required: glob libraries don't treat Windows backslashes as
// path separators, so path.join() globs would silently match nothing.
const here = path.dirname(fileURLToPath(import.meta.url)).replace(/\\/g, '/');

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [`${here}/index.html`, `${here}/src/**/*.{js,jsx}`],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        soft: '0 4px 24px -8px rgb(15 23 42 / 0.12)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
