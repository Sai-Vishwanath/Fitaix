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
        // ── Backgrounds ───────────────────────────────────────────────────────
        background: '#0A0A0A',
        card: {
          DEFAULT: '#161616',
          inset:   '#101010',
        },
        // ── Brand (gold-family palette, CSS var names preserved from style guide)
        brand: {
          purple: '#F5C400', // --purple  (primary accent gold)
          violet: '#FFD60A', // --violet  (bright gold)
          pink:   '#FFB300', // --pink    (warm amber-gold)
          blue:   '#CA8A04', // --blue    (dark gold)
          cyan:   '#FDE68A', // --cyan    (pale cream-gold)
        },
        // ── Status / Semantic ─────────────────────────────────────────────────
        status: {
          green: '#A3E635',
          amber: '#F59E0B',
          red:   '#EF4444',
        },
        // ── Typography ────────────────────────────────────────────────────────
        text: {
          primary:   '#FFFFFF',
          secondary: '#B0AA9A',
        },
        // ── Border ────────────────────────────────────────────────────────────
        border: 'rgba(255, 214, 10, 0.09)',
      },

      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      borderRadius: {
        '2xl': '14px',
        '3xl': '18px',
        '4xl': '22px',
      },

      boxShadow: {
        'brand-glow': '0 10px 24px -6px rgba(245, 196, 0, 0.6)',
        'card-base':  '0 1px 3px rgba(0, 0, 0, 0.6)',
      },

      animation: {
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'fade-in':   'fade-in 0.2s ease-out',
        'slide-up':  'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'breathe':   'breathe 3.4s ease-in-out infinite',
      },

      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1'   },
          '50%':      { opacity: '0.3' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        // Hero body-figure glow pulse (RecoveryPage)
        'breathe': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.30))' },
          '50%':      { filter: 'drop-shadow(0 0 14px rgba(250,204,21,0.65))' },
        },
      },
    },
  },

  plugins: [
    // Utility to hide scrollbars cross-browser while keeping scroll behaviour
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none',
          'scrollbar-width':    'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
};