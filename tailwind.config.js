/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#852837",
        secondary: "#614c90",
      },
      fontFamily: {
        primary: ["Primary"],
        secondary: ["Secondary"],
        tertiary: ["Tertiary"],
      },
    },
  },
  plugins: [],
};
