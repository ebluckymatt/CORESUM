import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0f172a",
          steel: "#1e293b",
          sand: "#e2e8f0",
          clay: "#c2410c",
          moss: "#166534",
          alert: "#b91c1c"
        }
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
