/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Celeste claro (sky-500)
          600: '#0284c7', // Celeste medio (sky-600)
          700: '#0369a1', // Celeste oscuro (sky-700)
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        navy: {
          50: '#f0f5fa',
          100: '#d9e5f0',
          200: '#b3cae0',
          300: '#8dafd0',
          400: '#6794c0',
          500: '#4679aa',
          600: '#365e84',
          700: '#26435e',
          800: '#1a365d', // El azul marino profundo de la cabecera
          900: '#0f2038',
        },
        brand: {
          blue: '#0ea5e9', // El celeste brillante para botones principales
          darkInput: '#2d2d2d', // El color gris oscuro de los selectores/inputs
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
