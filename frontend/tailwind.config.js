/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1b4435',
        'primary-dark': '#173c30',
        'primary-light': '#285a45',
        accent: '#8fb56a',
        'accent-light': '#dfe9d4',
        'accent-muted': '#6c8e54',
        text: {
          primary: '#18332c',
          secondary: '#65746b',
          muted: '#849087'
        },
        bg: {
          default: '#f5f5ef',
          alt: '#f7f7f1',
          card: '#fff'
        },
        border: '#e6e9df'
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Manrope', 'sans-serif']
      }
    }
  },
  plugins: []
}
