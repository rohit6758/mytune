/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Brand gradient: equal tangerine + red */
        "primary":            "#FF7A20",   /* mid tangerine-red */
        "primary-container":  "#FF6820",   /* slightly more red */
        "secondary-container":"#FF3C20",   /* vivid red-orange */
        "tangerine":          "#FF9900",   /* pure tangerine */
        "bright-red":         "#FF2020",   /* pure red */
        /* Surface palette — dark */
        "background":              "#000000",
        "surface":                 "#131313",
        "surface-dim":             "#131313",
        "surface-container-lowest":"#0e0e0e",
        "surface-container-low":   "#1c1b1b",
        "surface-container":       "#20201f",
        "surface-container-high":  "#2a2a2a",
        "surface-container-highest":"#353535",
        "surface-variant":         "#353535",
        "surface-bright":          "#393939",
        "surface-tint":            "#FF9900",
        /* On-surface */
        "on-background":           "#e5e2e1",
        "on-surface":              "#e5e2e1",
        "on-surface-variant":      "#c9b0a0",
        "on-primary":              "#1a0000",
        "on-primary-container":    "#fff0e8",
        "on-secondary":            "#5c0000",
        "on-secondary-container":  "#fff0ec",
        /* Utility */
        "outline":             "#a38d7a",
        "outline-variant":     "#554434",
        "inverse-primary":     "#8a5100",
        "inverse-surface":     "#e5e2e1",
        "inverse-on-surface":  "#313030",
        "error":               "#ffb4ab",
        "error-container":     "#93000a",
        "on-error":            "#690005",
        "on-error-container":  "#ffdad6",
        "cotton-white":        "#FFFBF5",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg":   "0.5rem",
        "xl":   "0.75rem",
        "2xl":  "1rem",
        "3xl":  "1.5rem",
        "full": "9999px",
      },
      spacing: {
        "xs":               "4px",
        "sm":               "12px",
        "md":               "24px",
        "lg":               "48px",
        "xl":               "80px",
        "2xl":              "64px",
        "base":             "8px",
        "gutter":           "24px",
        "card-gap":         "20px",
        "section-stack":    "40px",
        "container-margin": "24px",
        "margin-mobile":    "16px",
        "margin-desktop":   "40px",
      },
      fontFamily: {
        sans: ["Montserrat", "Inter", "sans-serif"],
      },
      fontSize: {
        "headline-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "800" }],
        "headline-lg":        ["40px", { lineHeight: "1.2", fontWeight: "800" }],
        "headline-md":        ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        "body-lg":            ["18px", { lineHeight: "1.6", fontWeight: "500" }],
        "body-md":            ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-bold":         ["14px", { lineHeight: "1",   letterSpacing: "0.05em", fontWeight: "700" }],
        "label-sm":           ["12px", { lineHeight: "1",   fontWeight: "600" }],
        "display-lg":         ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "900" }],
      },
    }
  },
  plugins: [],
}
