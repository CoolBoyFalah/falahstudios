import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--os-${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        raised: token("raised"),
        line: token("border"),
        fg: token("text"),
        muted: token("muted"),
        faint: token("faint"),
        gold: {
          DEFAULT: token("amber"),
          light: token("amber-light"),
          deep: token("amber-deep"),
          text: token("amber-text"),
        },
        danger: token("danger"),
        success: token("success"),
        info: token("info"),
        chart: token("chart"),
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Geeza Pro", "Noto Sans Arabic", "Segoe UI", "Tahoma", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
        "slide-in": { from: { transform: "translateX(var(--slide-from, 100%))" }, to: { transform: "none" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "slide-in": "slide-in 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
