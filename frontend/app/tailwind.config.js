/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        card: {
          DEFAULT: 'var(--card)',
          inset:   'var(--card-inset)',
        },
        brand: {
          purple: '#F5C400',
          violet: '#FFD60A',
          pink:   '#FFB300',
          blue:   '#CA8A04',
          cyan:   '#FDE68A',
        },
        status: {
          green: '#A3E635',
          amber: '#F59E0B',
          red:   '#EF4444',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        border: 'var(--border)',
      },
      boxShadow: {
        'brand-glow': '0 10px 28px -10px rgba(245, 196, 0, 0.45)',
        'card-base':  '0 4px 16px -4px rgba(0, 0, 0, 0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)',    opacity: '0.85' },
          '50%':      { transform: 'scale(1.06)', opacity: '1'    },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)'    },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%':      { opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in':   'fade-in 0.3s ease-out both',
        'slide-up':  'slide-up 0.35s ease-out both',
        breathe:     'breathe 3s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        twinkle:     'twinkle 2.6s ease-in-out infinite',
        float:       'float 3.4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};
