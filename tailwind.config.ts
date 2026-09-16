import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Темный фиолетовый фон
        'dark-purple': {
          900: '#1a0b2e',
          800: '#2d1b4e',
          700: '#3d2b5e',
          600: '#4d3b6e',
        },
        // Неоново-розовый акцент
        'neon-pink': {
          500: '#ff006e',
          400: '#ff3d8f',
          300: '#ff5da0',
          200: '#ff7db1',
        },
        // Неоново-голубой акцент
        'neon-cyan': {
          500: '#00d9ff',
          400: '#42e5ff',
          300: '#6eedff',
          200: '#9af4ff',
        },
        // Текст
        'text-light': {
          100: '#ffffff',
          200: '#f0f0f0',
          300: '#b8b8d1',
          400: '#8989a8',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-glow': 'linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(0, 217, 255, 0.1))',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.3)',
        'neon-glow': '0 0 30px rgba(255, 0, 110, 0.3), 0 0 60px rgba(0, 217, 255, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
