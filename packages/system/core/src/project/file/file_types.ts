import {
  App,
  Component,
  KeyframeSheet,
  PackageSheet,
  Router,
  StyleModifierSheet,
  Stylesheet,
  StyleSystem,
  StyleVariableSheet,
  TypefaceSheet,
} from "~/_models/_.js";

export const fileModelTypes = {
  component: "component",
  router: "router",
  app: "app",
  packageSheet: "package-sheet",
  stylesheet: "stylesheet",
  styleSystem: "style-system",
  styleVariableSheet: "variable-sheet",
  styleModifierSheet: "style-modifier-sheet",
  keyframeSheet: "keyframe-sheet",
  typefaceSheet: "typeface-sheet",
} as const;

export type FileModelType =
  (typeof fileModelTypes)[keyof typeof fileModelTypes];

export type FileModelTypeInterfaceMap = {
  [fileModelTypes.component]: Component;
  [fileModelTypes.router]: Router;
  [fileModelTypes.app]: App;
  [fileModelTypes.packageSheet]: PackageSheet;
  [fileModelTypes.stylesheet]: Stylesheet;
  [fileModelTypes.styleSystem]: StyleSystem;
  [fileModelTypes.styleVariableSheet]: StyleVariableSheet;
  [fileModelTypes.styleModifierSheet]: StyleModifierSheet;
  [fileModelTypes.keyframeSheet]: KeyframeSheet;
  [fileModelTypes.typefaceSheet]: TypefaceSheet;
};

export type FileModelInterface<T extends FileModelType> =
  FileModelTypeInterfaceMap[T];
