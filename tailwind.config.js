/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-100': '#1a1a1a',
        'dark-200': '#2d2d2d',
        'dark-300': '#404040',
        'dark-400': '#525252',
        'light-100': '#ffffff',
        'light-200': '#f5f5f5',
        'light-300': '#e5e5e5',
        'blue-gradient-start': '#3b82f6',
        'blue-gradient-end': '#1d4ed8',
        'orange-gradient-start': '#f97316',
        'orange-gradient-end': '#ea580c',
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        'gradient-orange': 'linear-gradient(135deg, #f97316, #ea580c)',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
