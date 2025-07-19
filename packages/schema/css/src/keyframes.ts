import type {
  KeyframeSetData,
  StyleFragmentData,
} from "@elllphnt/elementa-base";
import type { StyleToCssContext } from "./style/style.js";
import { styleToCss } from "./style/style.js";

/** Format a keyframes block in clean, minimal CSS. */
export function keyFrameSetToCss(data: KeyframeSetData): string {
  if (!data.groups || !data.name) return "";

  // Build a map for quick fragment lookup
  const fragmentMap: Record<string, StyleFragmentData> = Object.fromEntries(
    (data.styleFragments ?? []).map((fragment) => [fragment.id, fragment])
  );
  const styleContext: StyleToCssContext = {
    getFragment: (type, id) => {
      const fragment = fragmentMap[id];
      return fragment && fragment.type === type ? fragment : undefined;
    },
  };

  // Each keyframe group: offsets (array), style (object)
  const keyframes: string[] = [];

  for (const group of data.groups) {
    if (!group.offsets || !group.style) continue;
    const [style, _] = styleToCss(group.style, styleContext);
    if (!style || Object.keys(style).length === 0) continue;

    // Format offsets: [0,1] => "0%, 100%"
    const selector = group.offsets.map((o) => `${o * 100}%`).join(", ");

    // Consistent 2-space indentation for properties
    const props = Object.entries(style)
      .map(([k, v]) => `    ${k}: ${v};`)
      .join("\n");

    keyframes.push(`  ${selector} {\n${props}\n  }`);
  }

  if (keyframes.length === 0) return "";

  return [`@keyframes ${data.name} {`, ...keyframes, `}`].join("\n");
}
