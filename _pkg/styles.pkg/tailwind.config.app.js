const common = require("./tailwind.config.common");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...common,
  content: [
    "../../_app/elllephant.app/src/**/*.{js,ts,jsx,tsx}",
    "../../_app/elll.app/components/**/*.{js,ts,jsx,tsx}",
    "../../_app/elll.app/app/**/*.{js,ts,jsx,tsx}",
    "../components.pkg/src/**/*.{js,ts,jsx,tsx}",
    "../shell.pkg/src/**/*.{js,ts,jsx,tsx}",
  ],
};
