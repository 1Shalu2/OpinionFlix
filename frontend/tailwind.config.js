/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: '#0a0a0f',
        deepPurple: '#1a0a2e',
        neonBlue: '#06b6d4',
        neonPurple: '#8b5cf6',
        crimson: '#dc2626',
        surface: {
          dark: '#111118',
          DEFAULT: '#16161d',
          light: '#1e1e28',
          lighter: '#2a2a36',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.1)',
          strong: 'rgba(255, 255, 255, 0.15)',
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
        'neon-gradient': 'linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #8b5cf6 100%)',
        'crimson-gradient': 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)',
        'neon-strong': '0 0 30px rgba(6, 182, 212, 0.5), 0 0 80px rgba(6, 182, 212, 0.2)',
        'purple': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)',
        'crimson': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
