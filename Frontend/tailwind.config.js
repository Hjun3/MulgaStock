/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#131825',
          tertiary: '#1c2333',
          elevated: '#252b3d',
        },
        border: {
          DEFAULT: '#2a3142',
          strong: '#3b4255',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        up: {
          DEFAULT: '#ef4444',
          bg: '#ef444420',
          border: '#ef444440',
        },
        down: {
          DEFAULT: '#3b82f6',
          bg: '#3b82f620',
          border: '#3b82f640',
        },
        flat: {
          DEFAULT: '#94a3b8',
          bg: '#94a3b820',
        },
        accent: {
          primary: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'D2Coding', 'monospace'],
      },
    },
  },
  plugins: [],
};
