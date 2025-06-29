import { App } from "~/models/app/app.js";
import { Component } from "~/models/component/component.js";
import { PackageSheet } from "~/models/packages/package_sheet.js";
import { Router } from "~/models/router/router.js";
import { KeyframeSheet } from "~/models/style/keyframes/keyframe_sheet.js";
import { StyleModifierSheet } from "~/models/style/style_modifiers/style_modifier_sheet.js";
import { StyleSystem } from "~/models/style/style_system/style_system.js";
import { StyleVariableSheet } from "~/models/style/style_variables/style_variable_sheet.js";
import { Stylesheet } from "~/models/style/stylesheet/stylesheet.js";
import { TypefaceSheet } from "~/models/style/typefaces/typeface_sheet.js";

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
