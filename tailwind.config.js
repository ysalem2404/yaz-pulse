/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Satoshi", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "var(--color-bg)",
          surface: "var(--color-surface)",
          surface2: "var(--color-surface-2)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          faint: "var(--color-text-faint)",
        },
        accent: "var(--color-accent)",
        border: "var(--color-border)",
      },
    },
  },
  plugins: [],
};
