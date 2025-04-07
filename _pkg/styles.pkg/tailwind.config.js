/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      pm: {
        DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
        ctr: "rgb(255 255 255 / <alpha-value>)",
        100: "rgb(var(--color-primary-100) / <alpha-value>)",
        200: "rgb(var(--color-primary-200) / <alpha-value>)",
        300: "rgb(var(--color-primary-300) / <alpha-value>)",
        400: "rgb(var(--color-primary-400) / <alpha-value>)",
        500: "rgb(var(--color-primary-500) / <alpha-value>)",
      },
      bg: {
        DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
        ctr: "rgb(var(--color-foreground-500) / <alpha-value>)",
        100: "rgb(var(--color-background-100) / <alpha-value>)",
        200: "rgb(var(--color-background-200) / <alpha-value>)",
        300: "rgb(var(--color-background-300) / <alpha-value>)",
        400: "rgb(var(--color-background-400) / <alpha-value>)",
      },
      fg: {
        DEFAULT: "rgb(var(--color-foreground) / <alpha-value>)",
        ctr: "rgb(var(--color-background-500) / <alpha-value>)",
        100: "rgb(var(--color-foreground-100) / <alpha-value>)",
        200: "rgb(var(--color-foreground-200) / <alpha-value>)",
        300: "rgb(var(--color-foreground-300) / <alpha-value>)",
        400: "rgb(var(--color-foreground-400) / <alpha-value>)",
        500: "rgb(var(--color-foreground-500) / <alpha-value>)",
      },
      red: {
        DEFAULT: "rgb(var(--color-red) / <alpha-value>)",
        ctr: "rgb(255 255 255 / <alpha-value>)",
      },
      green: {
        DEFAULT: "rgb(var(--color-green) / <alpha-value>)",
        ctr: "rgb(255 255 255 / <alpha-value>)",
      },
      yellow: {
        DEFAULT: "rgb(var(--color-yellow) / <alpha-value>)",
        ctr: "rgb(255 255 255 / <alpha-value>)",
      },
      purple: {
        DEFAULT: "rgb(var(--color-purple) / <alpha-value>)",
        ctr: "rgb(255 255 255 / <alpha-value>)",
      },
      blue: {
        DEFAULT: "rgb(var(--color-blue) / <alpha-value>)",
        ctr: "rgb(255 255 255 / <alpha-value>)",
      },
    },
    borderColor: (theme) => ({
      ...theme("colors"),
      DEFAULT: theme("colors.fg.100"),
    }),
    placeholderColor: (theme) => ({
      ...theme("colors"),
      DEFAULT: theme("colors.fg.300"),
    }),
    fontSize: {
      "xs": ["11px", { lineHeight: "1.4" }],
      "sm": ["12px", { lineHeight: "1.4" }],
      "base": ["13px", { lineHeight: "1.4" }],
      "lg": ["15px", { lineHeight: "1.4" }],
      "xl": ["18px", { lineHeight: "1.4" }],
      "2xl": ["20px", { lineHeight: "1.4" }],
      "3xl": ["24px", { lineHeight: "1.4" }],
      "4xl": ["30px", { lineHeight: "1.4" }],
      "5xl": ["36px", { lineHeight: "1.4" }],
      "6xl": ["48px", { lineHeight: "1.4" }],
      "7xl": ["64px", { lineHeight: "1.4" }],
      "8xl": ["80px", { lineHeight: "1.4" }],
      "9xl": ["96px", { lineHeight: "1.4" }],
    },
    extend: {},
  },
  prefix: "el-",
  content: [
    "../elll.pkg/src/**/*.{js,ts,jsx,tsx}",
    "../editor.pkg/src/**/*.{js,ts,jsx,tsx}",
    "../components.pkg/src/**/*.{js,ts,jsx,tsx}",
    "../shell.pkg/src/**/*.{js,ts,jsx,tsx}",
  ],
};
