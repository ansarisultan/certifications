/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
        },
        secondary: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        accent: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        warm: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        success: {
          400: '#34D399',
          500: '#10B981',
        },
        obsidian: {
          900: '#050816',
          800: '#0A0F1E',
          700: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #6366F1, #06B6D4)',
        'gradient-cyber': 'linear-gradient(135deg, #6366F1, #06B6D4, #F43F5E)',
        'gradient-warm': 'linear-gradient(135deg, #F59E0B, #FB7185, #6366F1)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        glow: '0 0 30px rgba(99,102,241,0.15)',
        'glow-primary': '0 0 40px rgba(99,102,241,0.3)',
        '3d': '0 20px 60px -10px rgba(0,0,0,0.8)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slideUp 0.5s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg) scale(1.02)' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 20px rgba(99,102,241,0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(99,102,241,0.3)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
