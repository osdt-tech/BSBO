/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false, // Tailwind-Reset ausschalten
  },
  theme: {
    extend: {
      colors: {
        pastel: {
          green: '#A5D6A7',
          blue: '#90CAF9',
          cyan: '#80DEEA',
          yellow: '#FFF59D',
          orange: '#FFCC80',
          red: '#EF9A9A',
          pink: '#F48FB1',
          purple: '#CE93D8',
          gray: '#CFD8DC',
          brown: '#BCAAA4',
          mint: '#B2DFDB',
          sand: '#FFE0B2',
        },
      },
    },
  },
  plugins: [],
}
