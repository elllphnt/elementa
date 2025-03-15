const variantWeightNames = {
  "100": "Thin",
  "200": "ExtraLight",
  "300": "Light",
  "400": "Regular",
  "500": "Medium",
  "600": "SemiBold",
  "700": "Bold",
  "800": "ExtraBold",
  "900": "Black",
};

export function getVariantWeight(variant: string) {
  if (["regular", "normal"].includes(variant)) {
    return "400";
  }
  const weight = (variant.match(/^\d+/)?.[0] ??
    "400") as keyof typeof variantWeightNames;

  return weight;
}

export function fontVariantName(variant: string) {
  const weight = getVariantWeight(variant);

  if (variant.endsWith("italic")) {
    return `${variantWeightNames[weight]} Italic`;
  } else {
    return `${variantWeightNames[weight]}`;
  }
}
