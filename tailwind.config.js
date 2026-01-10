/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Custom breakpoints for better mobile control
    screens: {
      'xs': '375px',   // Small phones (iPhone SE, etc.)
      'sm': '640px',   // Large phones / small tablets
      'md': '768px',   // Tablets (iPad mini)
      'lg': '1024px',  // Small laptops (iPad Pro)
      'xl': '1280px',  // Desktops
      '2xl': '1536px', // Large desktops
    },
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd7ff',
          300: '#8ebfff',
          400: '#599eff',
          500: '#3478f6',
          600: '#1e5aeb',
          700: '#1646d8',
          800: '#183aaf',
          900: '#19358a',
          950: '#142254',
        },
        // Safety status colors - semantic
        safety: {
          critical: {
            DEFAULT: '#dc2626',
            light: '#fef2f2',
            dark: '#991b1b',
          },
          warning: {
            DEFAULT: '#f97316',
            light: '#fff7ed',
            dark: '#c2410c',
          },
          caution: {
            DEFAULT: '#eab308',
            light: '#fefce8',
            dark: '#a16207',
          },
          info: {
            DEFAULT: '#3478f6',
            light: '#eef5ff',
            dark: '#1646d8',
          },
          success: {
            DEFAULT: '#22c55e',
            light: '#f0fdf4',
            dark: '#15803d',
          },
        },
        // Neutral grays
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      // Consistent border radius
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      // Consistent spacing
      spacing: {
        '4.5': '1.125rem',
        '11': '2.75rem',    // 44px - minimum touch target
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        'touch': '2.75rem', // 44px alias for touch targets
      },
      // Minimum width/height for touch targets
      minWidth: {
        'touch': '2.75rem', // 44px
      },
      minHeight: {
        'touch': '2.75rem', // 44px
      },
      // Typography
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      // Box shadows with brand colors
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 8px 24px -4px rgba(0, 0, 0, 0.06)',
        'strong': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 16px 40px -8px rgba(0, 0, 0, 0.08)',
        'glow-primary': '0 0 20px -4px rgba(52, 120, 246, 0.4)',
        'glow-success': '0 0 20px -4px rgba(34, 197, 94, 0.4)',
        'glow-danger': '0 0 20px -4px rgba(220, 38, 38, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      },
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'fade-in-down': 'fadeInDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-soft': 'pulseSoft 2s infinite ease-in-out',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      // Transitions
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
