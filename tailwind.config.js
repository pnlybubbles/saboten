/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/app/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ff7763',
        secondary: '#fbedeb',
        surface: 'rgb(240 240 240 / 1)',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
}
