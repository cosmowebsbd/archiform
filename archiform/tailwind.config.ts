import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Brand colors
        brand: {
          50:  '#f0eeff',
          100: '#e3deff',
          200: '#c9bcff',
          300: '#a892ff',
          400: '#8b6bff',
          500: '#6c5ce7',  // Primary purple
          600: '#5a48d4',
          700: '#4836b8',
          800: '#3a2b96',
          900: '#2d2278',
          950: '#1a1350',
        },
        // Dark navy - sidebar, headings
        navy: {
          50:  '#eef0f7',
          100: '#d5daea',
          200: '#adb8d5',
          300: '#7f94be',
          400: '#5a74aa',
          500: '#3d5a93',
          600: '#2d4578',
          700: '#1f325c',
          800: '#152241',
          900: '#0e1628',
          950: '#090e1a',
        },
        // Semantic
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'counter-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-in-left': 'fade-in-left 0.5s ease-out both',
        'slide-in-right': 'slide-in-right 0.5s ease-out both',
        'counter-up': 'counter-up 0.6s ease-out both',
        shimmer: 'shimmer 2s infinite linear',
        pulse: 'pulse 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(255,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(242,100%,70%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(255,100%,74%,0.08) 0px, transparent 50%)',
        'dot-pattern': 'radial-gradient(circle, #6c5ce720 1px, transparent 1px)',
        'grid-pattern': 'linear-gradient(rgba(108,92,231,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-sm': '20px 20px',
        'dot-md': '30px 30px',
        'grid-sm': '30px 30px',
        'grid-md': '50px 50px',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(108, 92, 231, 0.15)',
        'glow-md': '0 0 40px rgba(108, 92, 231, 0.2)',
        'glow-lg': '0 0 60px rgba(108, 92, 231, 0.25)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
