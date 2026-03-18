export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050510',
        card: '#0B0F1A',
        accent1: '#6C63FF',
        accent2: '#00E5FF',
        secondary: '#00FF9C',
        textPrimary: '#FFFFFF',
        textMuted: '#9CA3AF'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.25rem'
      }
    },
  },
  plugins: [],
}
