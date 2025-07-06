import type { TypefaceData } from "@elllphnt/elementa-base";

export function typefaceToCSS(data: TypefaceData): string {
  if (!data.definition) {
    return "";
  }

  const { srcset, variants } = data.definition;

  // Generate @font-face rules
  const fontFaceRules = variants.map((variant) => {
    const fontStyle = variant.includes("italic") ? "italic" : "normal";
    const fontWeight = variant.match(/\d+/)?.[0] ?? "400"; // Default to 400 if not specified

    return [
      `@font-face {`,
      `  font-family: '${data.definition?.family}';`,
      `  src: url("${srcset[variant]}");`,
      `  font-weight: ${fontWeight};`,
      `  font-style: ${fontStyle};`,
      `}`,
    ].join("\n");
  });

  return fontFaceRules.join("\n\n");
}
