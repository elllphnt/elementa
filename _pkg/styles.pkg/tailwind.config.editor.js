const common = require("./tailwind.config.common");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...common,
  prefix: "el-",
  content: [
    "../elll.pkg/src/**/*.{js,ts,jsx,tsx}",
    "../editor.pkg/src/**/*.{js,ts,jsx,tsx}",
    "../components.pkg/src/**/*.{js,ts,jsx,tsx}",
    "../shell.pkg/src/**/*.{js,ts,jsx,tsx}",
  ],
};
