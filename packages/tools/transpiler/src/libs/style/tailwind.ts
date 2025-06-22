import {
  isVarRef,
  stringifyFlexibleStyleData,
  StyleData,
  stylePropertyConfigMap,
  StylePropertyName,
} from "@elllphnt/elementa-base";
import { stylePropertyToTwConfigMap } from "./properties.js";

export function styleToTailwind(data: StyleData): string[] {
  const classes = new Set<string>();

  for (const property in data) {
    const value = data[property as StylePropertyName];
    if (value === undefined || value === "unset") {
      continue;
    }
    const tgConfig = stylePropertyToTwConfigMap[property as StylePropertyName];
    const cssConfig = stylePropertyConfigMap[property as StylePropertyName];

    if (tgConfig.toTw) {
      (tgConfig.toTw as any)(value).forEach((twClass: string) =>
        classes.add(twClass)
      );
    } else {
      if (isVarRef(value)) {
        if (tgConfig.utility) {
          classes.add(`${tgConfig.utility}-(${value.__var})`);
        } else {
          classes.add(`[${property}:(${value.__var})]`);
        }
      } else {
        if (tgConfig.toTwRaw) {
          (tgConfig.toTwRaw as any)(value).forEach((twClass: string) =>
            classes.add(twClass)
          );
        } else {
          if (tgConfig.utility) {
            classes.add(
              `${tgConfig.utility}-[${stringifyFlexibleStyleData(
                value,
                ...cssConfig.types
              )}]`.replaceAll(" ", "_")
            );
          } else {
            classes.add(
              `[${property}:${stringifyFlexibleStyleData(
                value,
                ...cssConfig.types
              )}]`.replaceAll(" ", "_")
            );
          }
        }
      }
    }
  }

  return Array.from(classes);
}
