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
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)"
      },
      boxShadow: {
        card: "0 24px 60px rgba(15, 23, 42, 0.08)",
        glow: "0 18px 35px rgba(11, 109, 166, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "mesh-grid":
          "radial-gradient(circle at top left, rgba(73, 190, 185, 0.28), transparent 28%), radial-gradient(circle at 70% 0, rgba(247, 180, 68, 0.24), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.96), rgba(242,248,249,0.88))"
      }
    }
  },
  plugins: []
};

export default config;
