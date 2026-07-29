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
    },
  },
  plugins: [],
};