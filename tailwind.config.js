/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bakery: {
          // Primary — Deep Bakery Blue
          primary: '#145DA0',
          'primary-dark': '#0B3D91',
          'primary-light': '#3A82D6',
          // Light Blue
          sky: '#EAF4FF',
          // Cream
          cream: '#FFF8ED',
          'cream-dark': '#FBEAD4',
          // Text
          ink: '#172033',
        },
        accent: {
          gold: '#C8924A',
          'gold-light': '#E0B97A',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(20, 93, 160, 0.15)',
        card: '0 8px 30px -12px rgba(20, 93, 160, 0.22)',
        glow: '0 0 0 1px rgba(20, 93, 160, 0.08), 0 12px 40px -16px rgba(11, 61, 145, 0.35)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
