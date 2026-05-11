import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'short': { 'raw': '(max-height: 720px)' },
        'very-short': { 'raw': '(max-height: 600px)' },
      },
      colors: {
        coffee: {
          light: '#6F4E37',
          DEFAULT: '#4B2C20',
          dark: '#351F17',
        },
      },
    },
  },
  plugins: [],
};
export default config;
