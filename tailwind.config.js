/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        portal: {
          navy: '#19324d',
          'navy-dark': '#122438',
          'navy-light': '#214266',
          orange: '#ea580c',
          'orange-hover': '#c2410c',
          blue: '#0284c7',
          'blue-dark': '#0369a1',
          price: '#d32f2f',
          bg: '#f4f6f9',
          border: '#e2e8f0',
          'border-dark': '#cbd5e1',
          text: '#1e293b',
          'text-muted': '#64748b',
          'text-light': '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
