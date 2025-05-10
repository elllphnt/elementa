import { StyleData, StyleSheetData } from "@elllphnt/elll-element";
import _ from "lodash";
import { styleToTailwind } from "./tailwind.js";

// Compile all the styles related to a single selector
export function compileStyle({ style }: { style: StyleData }): string[] {
  return styleToTailwind(style);
}

// Compile an entire stylesheet for multiple selectors and their styles
export function compileStylesheet({ styles }: StyleSheetData): string[] {
  const classes = Object.entries(styles ?? {})
    .flatMap(([, style]) => {
      return compileStyle({
        style,
      });
    })
    .flat();

  return _.uniq(classes);
}
