/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "primary": "#121200",
        "primary-hover": "#2a2a00",
        "primary-container": "#e0e0db",
        "on-primary": "#ffffff",
        "on-primary-container": "#121200",
        "secondary": "#4a4a4a",
        "secondary-hover": "#333333",
        "secondary-container": "#e0e0db",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#121200",
        "background": "#ffffff",
        "on-background": "#121200",
        "surface": "#ffffff",
        "surface-container": "#f0f0ed",
        "surface-container-high": "#e0e0db",
        "on-surface": "#121200",
        "on-surface-variant": "#333333",
        "outline": "#a0a09b",
        "outline-variant": "#d0d0cb",
        "error": "#963B3B",
        "on-error": "#ffffff",
        "error-container": "#F2D5D5",
        "on-error-container": "#4A1A1A",
        "success": "#3B7A57",
        "warning": "#B8860B",
        "info": "#4682B4"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "container-padding-mobile": "20px",
        "unit": "8px",
        "gutter": "24px",
        "container-padding-desktop": "40px",
        "glass-padding": "24px"
      },
      "fontFamily": {
        "headline-xl": ["Outfit", "sans-serif"],
        "label-sm": ["Outfit", "sans-serif"],
        "body-md": ["Outfit", "sans-serif"],
        "headline-md": ["Outfit", "sans-serif"],
        "headline-lg-mobile": ["Outfit", "sans-serif"],
        "body-lg": ["Outfit", "sans-serif"],
        "headline-lg": ["Outfit", "sans-serif"],
        "sans": ["Outfit", "sans-serif"]
      },
      "fontSize": {
        "headline-xl": ["80px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-sm": ["16px", { "lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-md": ["20px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-md": ["32px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "headline-lg-mobile": ["40px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "body-lg": ["22px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-lg": ["52px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600" }]
      }
    },
  },
  plugins: [],
}
