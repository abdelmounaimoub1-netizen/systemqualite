import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--surface) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          soft: "rgb(var(--brand-soft) / <alpha-value>)"
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)"
        },
        sun: {
          DEFAULT: "rgb(var(--sun) / <alpha-value>)",
          soft: "rgb(var(--sun-soft) / <alpha-value>)"
        },
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)"
      },
      boxShadow: {
        card: "0 22px 55px rgba(22, 44, 88, 0.1)",
        glow: "0 18px 35px rgba(0, 169, 218, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "mesh-grid":
          "radial-gradient(circle at top left, rgba(0, 169, 218, 0.22), transparent 28%), radial-gradient(circle at 70% 0, rgba(255, 205, 18, 0.24), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(236,247,252,0.9))"
      }
    }
  },
  plugins: []
};

export default config;
