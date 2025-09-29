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
        primary: {
          DEFAULT: "#0D98BA", // Blue-Green
          50: "#E6F5F9",
          100: "#CCE9F2",
          200: "#99D3E5",
          300: "#66BDD8",
          400: "#33A7CB",
          500: "#0D98BA", // Main color
          600: "#0A7695",
          700: "#075570",
          800: "#05394B",
          900: "#021C26",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#FF8200", // UT Orange
          50: "#FFF4E6",
          100: "#FFE9CC",
          200: "#FFD399",
          300: "#FFBD66",
          400: "#FFA733",
          500: "#FF8200", // Main color
          600: "#CC6800",
          700: "#994E00",
          800: "#663400",
          900: "#331A00",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "#FFBA00", // Selective Yellow
          50: "#FFFACC",
          100: "#FFF699",
          200: "#FFED66",
          300: "#FFE433",
          400: "#FFDD00",
          500: "#FFBA00", // Main color
          600: "#CC9500",
          700: "#997000",
          800: "#664A00",
          900: "#332500",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "#87CEEB", // Sky Blue
          50: "#F0F8FC",
          100: "#E1F1F9",
          200: "#C3E3F3",
          300: "#A5D5ED",
          400: "#87CEEB", // Main color
          500: "#6BB6D6",
          600: "#4F9EC1",
          700: "#3B7691",
          800: "#274E61",
          900: "#132730",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "#003153", // Prussian Blue (used for warnings/errors)
          50: "#E6EBF0",
          100: "#CCD7E0",
          200: "#99AFC1",
          300: "#6687A1",
          400: "#335F82",
          500: "#003153", // Main color
          600: "#002742",
          700: "#001D31",
          800: "#001421",
          900: "#000A10",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      fontFamily: {
        sans: ['var(--font-hebrew)', 'system-ui', 'sans-serif'],
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