module.exports = {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // New modern color palette
        dark: {
          100: "rgba(30, 30, 46, 0.8)",
          200: "rgba(23, 23, 39, 0.7)",
          300: "rgba(19, 19, 31, 0.85)",
          400: "rgba(15, 15, 25, 0.9)",
        },
        light: {
          100: "rgba(255, 255, 255, 0.95)",
          200: "rgba(247, 247, 249, 0.9)",
          300: "rgba(230, 230, 236, 0.8)",
        },
        blue: {
          gradient: {
            start: "rgba(52, 97, 255, 0.9)",
            end: "rgba(132, 84, 235, 0.9)",
          },
        },
        orange: {
          gradient: {
            start: "rgba(255, 107, 44, 0.9)",
            end: "rgba(255, 159, 44, 0.9)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(52, 97, 255, 0.5)',
        'glow-purple': '0 0 15px rgba(132, 84, 235, 0.5)',
        'glow-orange': '0 0 15px rgba(255, 107, 44, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(to right, rgba(52, 97, 255, 0.9), rgba(132, 84, 235, 0.9))',
        'gradient-orange': 'linear-gradient(to right, rgba(255, 107, 44, 0.9), rgba(255, 159, 44, 0.9))',
        'gradient-dark': 'linear-gradient(to right, rgba(30, 30, 46, 0.8), rgba(19, 19, 31, 0.8))',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
}