import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fantasy: {
          dark: '#1a0f0a',
          brown: '#3d2817',
          tan: '#8b6f47',
          gold: '#d4af37',
          green: '#4a6741',
          moss: '#6b8e23',
          stone: '#6b6866',
          light: '#f4e4c1',
          red: '#8b2f2f',
          blue: '#2f4f6b',
          purple: '#5c3d6b',
        },
        background: '#4a3f35',
        surface: '#3d2817',
        border: '#8b6f47',
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
