module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1919e6",
        "background-light": "#f6f6f8",
        "background-dark": "#111121",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
};