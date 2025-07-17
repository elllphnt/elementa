import type { App } from "./app/app.js";
import type { Component } from "./component/component.js";
import type { PackageSheet } from "./packages/package_sheet.js";
import type { Router } from "./router/router.js";
import type { StyleModifierSheet } from "./style/style_modifiers/style_modifier_sheet.js";
import type { StyleSystem } from "./style/style_system/style_system.js";
import type { StyleVariableSheet } from "./style/style_variables/style_variable_sheet.js";
import type { Stylesheet } from "./style/stylesheet/stylesheet.js";
import type { TypefaceSheet } from "./style/typefaces/typeface_sheet.js";

export const fileModelTypes = {
  app: "app",
  component: "component",
  router: "router",
  packageSheet: "package-sheet",
  stylesheet: "stylesheet",
  styleSystem: "style-system",
  styleVariableSheet: "variable-sheet",
  styleModifierSheet: "style-modifier-sheet",
  typefaceSheet: "typeface-sheet",
} as const;

export type FileModelTypeName =
  (typeof fileModelTypes)[keyof typeof fileModelTypes];

export type FileModelTypeMap = {
  [fileModelTypes.component]: Component;
  [fileModelTypes.router]: Router;
  [fileModelTypes.app]: App;
  [fileModelTypes.packageSheet]: PackageSheet;
  [fileModelTypes.stylesheet]: Stylesheet;
  [fileModelTypes.styleSystem]: StyleSystem;
  [fileModelTypes.styleVariableSheet]: StyleVariableSheet;
  [fileModelTypes.styleModifierSheet]: StyleModifierSheet;
  [fileModelTypes.typefaceSheet]: TypefaceSheet;
};

export type FileModelType<T extends FileModelTypeName> = FileModelTypeMap[T];
