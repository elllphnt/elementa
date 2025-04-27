import { KeyframeSetData, StyleFragmentData } from "@elllphnt/elementa-base";
import { styleToCss, StyleToCssContext } from "./style";

export function keyFrameSetToCss(data: KeyframeSetData): string {
  if (!data.keyframes || !data.name) {
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
  const keyframes: [number, string][] = [];

  for (const keyframe of data.keyframes ?? []) {
    if (keyframe.offset === undefined || !keyframe.style) {
      continue;
    }

    const style = styleToCss(keyframe.style, styleContext);
    const css = Object.entries(style)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n");

    keyframes.push([keyframe.offset, css]);
  }

  keyframes.sort((a, b) => a[0] - b[0]);

  const keyframesCss = keyframes.map(([offset, style]) => {
    return `${offset * 100}% { ${style} }`;
  });

  return [`@keyframes ${data.name} {`, ...keyframesCss, `}`].join("\n");
}
