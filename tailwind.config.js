/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/app/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main: 'rgb(24 24 27)',
        invert: 'rgb(250 250 250)',
        primary: '#ff7763',
        secondary: '#fbedeb',
        error: 'rgb(203 42 47)',
        surface: 'rgb(245 245 245 / 1)',
        backdrop: 'rgb(251 251 250 / 1)',
      },
      spacing: {
        18: '4.5rem',
      },
      boxShadow: {
        float: '0 0 0 1px rgb(0 0 0 / .08), 0 4px 4px rgba(0 13 32 / .04)',
        emboss: '0 0 0 1px rgb(0 0 0 / .08), 0 2px 2px rgba(0 13 32 / .04)',
        border: '0 0 0 1px rgb(0 0 0 / .08)',
        focus: 'inset 0 0 0 2px rgb(24 24 27)',
      },
    },
  },
  plugins: [],
}
