/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: '#450506',
        wine: '#2B0305',
        gold: '#B58A4A',
        champagne: '#E5D0A7',
        ivory: '#FAF7F1',
        charcoal: '#302724',
        sand: '#E9E1D7',
        muted: '#756B64',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
      },
      borderRadius: { control: '0.5rem', card: '0.75rem', panel: '1rem' },
      maxWidth: { site: '80rem' },
    },
  },
  plugins: [],
}
