export type ColorTheme = {
  background: string;
  text: string;
  grid: string;
  selection: string;
};

export type Theme = {
  light: ColorTheme;
  dark: ColorTheme;
};

export const defaultTheme: Theme = {
  light: {
    // background: "#f5f5f5",
    // text: "#000",
    // grid: "#8888",
    // selection: "#08f",
    background: "#0a0a0a",
    text: "#fff",
    grid: "#88888815",
    selection: "#08f",
  },
  dark: {
    background: "#0a0a0a",
    text: "#fff",
    grid: "#88888815",
    selection: "#08f",
  },
};
