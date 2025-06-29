export const elementaStandardPaths = {
  packages: ".elll/packages",
  // style
  styleSystem: ".elll/style/system",
  styleVariables: ".elll/style/variables",
  styleModifiers: ".elll/style/modifiers",
  typefaces: ".elll/style/typefaces",
  keyframes: ".elll/style/keyframes",
  stylesheet: (name: string) => `.elll/style/stylesheets/${name}`,
  // app
  app: ".elll/app",
};
