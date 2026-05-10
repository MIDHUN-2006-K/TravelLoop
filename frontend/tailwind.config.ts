import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Ocean Blue
        primary: {
          50: "#eef4ff",
          100: "#d9e5ff",
          200: "#bcd2ff",
          300: "#8eb8ff",
          400: "#5991ff",
          500: "#3366ff",
          600: "#1a45f5",
          700: "#1434e1",
          800: "#172db6",
          900: "#192b8f",
          950: "#141d57",
          DEFAULT: "#3366ff",
        },
        // Secondary - Warm Sunset
        secondary: {
          50: "#fff7ed",
          100: "#ffeed4",
          200: "#ffd9a8",
          300: "#ffbd71",
          400: "#ff9538",
          500: "#ff7a11",
          600: "#f05e07",
          700: "#c74508",
          800: "#9e380f",
          900: "#7f3010",
          950: "#451606",
          DEFAULT: "#ff7a11",
        },
        // Accent - Emerald
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
          DEFAULT: "#10b981",
        },
        // Surface colors
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Semantic
        success: { DEFAULT: "#10b981", light: "#d1fae5", dark: "#065f46" },
        warning: { DEFAULT: "#f59e0b", light: "#fef3c7", dark: "#92400e" },
        danger: { DEFAULT: "#ef4444", light: "#fee2e2", dark: "#991b1b" },
        info: { DEFAULT: "#3b82f6", light: "#dbeafe", dark: "#1e40af" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "glow": "0 0 20px rgba(51, 102, 255, 0.15)",
        "glow-lg": "0 0 40px rgba(51, 102, 255, 0.2)",
        "glow-orange": "0 0 20px rgba(255, 122, 17, 0.15)",
        "premium": "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        "premium-lg": "0 4px 6px rgba(0,0,0,0.04), 0 10px 40px rgba(0,0,0,0.08)",
        "premium-xl": "0 8px 16px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.1)",
        "inner-glow": "inset 0 1px 2px rgba(255,255,255,0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "fade-in-down": "fadeInDown 0.4s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "gradient": "gradientShift 8s ease infinite",
        "counter": "counter 1.5s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #141d57 0%, #1a45f5 50%, #3366ff 100%)",
        "sunset-gradient": "linear-gradient(135deg, #ff7a11 0%, #ff9538 50%, #ffbd71 100%)",
        "ocean-gradient": "linear-gradient(135deg, #192b8f 0%, #3366ff 50%, #5991ff 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
