import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        // Primary - Royal Blue Family (Design System)
        'royal-blue': {
          DEFAULT: '#00296b',
          50: '#f0f6ff',
          100: '#dbeafe',
          200: '#bdd7fd',
          300: '#8db8fa',
          400: '#5a96f7',
          500: '#00509d', // Polynesian Blue
          600: '#003f88', // Marian Blue
          700: '#00296b', // Royal Blue Traditional
          800: '#001f5a',
          900: '#001546',
          950: '#000b2e',
        },
        primary: {
          DEFAULT: "#00509d", // Polynesian Blue
          50: "#f0f6ff",
          100: "#dbeafe",
          200: "#bdd7fd",
          300: "#8db8fa",
          400: "#5a96f7",
          500: "#00509d",
          600: "#003f88",
          700: "#00296b",
          800: "#001f5a",
          900: "#001546",
          foreground: "#ffffff",
        },
        // Accent - Gold Family (Design System)
        gold: {
          DEFAULT: '#ffd500',
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fed7aa',
          300: '#fbbf24',
          400: '#fdc500', // Mikado Yellow
          500: '#ffd500', // Gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        accent: {
          DEFAULT: "#fdc500", // Mikado Yellow
          50: "#fefce8",
          100: "#fef3c7",
          200: "#fed7aa",
          300: "#fbbf24",
          400: "#fdc500",
          500: "#ffd500",
          600: "#d97706",
          700: "#b45309",
          foreground: "#00296b",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Semantic Colors (Design System)
        success: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#fdc500',
          50: '#fefce8',
          100: '#fef3c7',
          500: '#fdc500',
        },
        error: {
          DEFAULT: '#dc2626',
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#dc2626',
          600: '#b91c1c',
        },
        info: {
          DEFAULT: '#00509d',
          50: '#f0f6ff',
          100: '#dbeafe',
          500: '#00509d',
        },
        // Neutral Colors (Design System)
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      fontFamily: {
        sans: ['var(--font-hebrew)', 'system-ui', 'sans-serif'],
        formal: ['var(--font-formal)', 'serif'],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-rtl"),
  ],
}

export default config