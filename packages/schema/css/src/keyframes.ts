import type {
  KeyframeSetData,
  StyleFragmentData,
} from "@elllphnt/elementa-base";
import type { StyleToCssContext } from "./style/style.js";
import { styleToCss } from "./style/style.js";

export function keyFrameSetToCss(data: KeyframeSetData): string {
  if (!data.groups || !data.name) {
    return "";
  }

  const fragmentMap: Record<string, StyleFragmentData> = Object.fromEntries(
    (data.styleFragments ?? []).map((fragment) => [fragment.id, fragment])
  );
  const styleContext: StyleToCssContext = {
    getFragment: (type, id) => {
      const fragment = fragmentMap[id];
      if (fragment && fragment.type === type) {
        return fragment as StyleFragmentData<typeof type>;
      } else {
        return undefined;
      }
    },
  };
  const keyframes: [number[], string][] = [];

  for (const keyframe of data.groups ?? []) {
    if (keyframe.offsets === undefined || !keyframe.style) {
      continue;
    }

    const style = styleToCss(keyframe.style, styleContext);
    const css = Object.entries(style)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n");

    keyframes.push([keyframe.offsets, css]);
  }

  const keyframesCss = keyframes.map(([offsets, style]) => {
    const selector = offsets.map((offset) => `${offset * 100}%`).join(", ");
    return `  ${selector} {\n${style}\n  }`;
  });

  return [`@keyframes ${data.name} {`, ...keyframesCss, `}`].join("\n");
}
