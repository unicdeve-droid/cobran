import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1351b4',
          dark: '#0d3f8f',
          light: '#e6edf9',
        },
        success: {
          DEFAULT: '#168821',
          dark: '#0f6417',
          light: '#e5f4e6',
        },
      },
      fontFamily: {
        sans: [
          'Rawline',
          'Raleway',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
      },
      keyframes: {
        'modal-in': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'overlay-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'modal-in': 'modal-in 0.2s ease-out',
        'overlay-in': 'overlay-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
