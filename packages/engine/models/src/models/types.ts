import { App } from "./app/app.js";
import { Component } from "./component/component.js";
import { PackageSheet } from "./packages/package_sheet.js";
import { Router } from "./router/router.js";
import { KeyframeSheet } from "./style/keyframes/keyframe_sheet.js";
import { StyleModifierSheet } from "./style/style_modifiers/style_modifier_sheet.js";
import { StyleSystem } from "./style/style_system/style_system.js";
import { StyleVariableSheet } from "./style/style_variables/style_variable_sheet.js";
import { Stylesheet } from "./style/stylesheet/stylesheet.js";
import { TypefaceSheet } from "./style/typefaces/typeface_sheet.js";

export const fileModelTypes = {
  app: "app",
  component: "component",
  router: "router",
  packageSheet: "package-sheet",
  stylesheet: "stylesheet",
  styleSystem: "style-system",
  styleVariableSheet: "variable-sheet",
  styleModifierSheet: "style-modifier-sheet",
  keyframeSheet: "keyframe-sheet",
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
  [fileModelTypes.keyframeSheet]: KeyframeSheet;
  [fileModelTypes.typefaceSheet]: TypefaceSheet;
};

export type FileModelType<T extends FileModelTypeName> = FileModelTypeMap[T];
