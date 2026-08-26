import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "var(--navy)", deep: "var(--navy-deep)" },
        teal: { DEFAULT: "var(--teal)", deep: "var(--teal-deep)" },
        violet: { DEFAULT: "var(--violet)", deep: "var(--violet-deep)" },
        coral: { DEFAULT: "var(--coral)", deep: "var(--coral-deep)" },
        ink: "var(--ink)",
        slate: { DEFAULT: "var(--slate)", soft: "var(--slate-soft)" },
        mist: "var(--mist)",
        paper: "var(--paper)",
        surface: "var(--white)",
        success: { DEFAULT: "var(--success)", soft: "var(--success-soft)" },
        warning: { DEFAULT: "var(--warning)", soft: "var(--warning-soft)" },
        danger: { DEFAULT: "var(--danger)", soft: "var(--danger-soft)" },
        xp: { DEFAULT: "var(--xp)", deep: "var(--xp-deep)" },
        gems: { DEFAULT: "var(--gems)", deep: "var(--gems-deep)" },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
      },
    },
  },
  plugins: [],
};

export default config;
