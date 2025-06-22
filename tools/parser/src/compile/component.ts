import { ComponentData } from "@elllphnt/elementa-base";
import {
  getStylesheetFromCssModule,
  parseComponentModule,
  parseCssModule,
} from "../parsers/_.js";

export function compileComponentToElll({
  tsx,
  css = "",
}: {
  tsx: string;
  css?: string;
}): ComponentData {
  const parsedCssModule = parseCssModule(css);
  const componentData = parseComponentModule({
    sourceCode: tsx,
    getStylesheet: (id) => {
      return getStylesheetFromCssModule({
        id,
        module: parsedCssModule,
        classes: [],
        conditionals: {},
        getModifierDefinition: () => undefined,
      });
    },
  });
  return componentData;
}
