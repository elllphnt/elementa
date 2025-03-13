// ./colorConversions.ts
export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };
export type OKLCH = { l: number; c: number; h: number };
export type OKLAB = { l: number; a: number; b: number };

// Convert OKLAB to OKLCH
export function oklabToOklch({ l, a, b }: OKLAB): OKLCH {
  return {
    l,
    c: Math.sqrt(a * a + b * b),
    h: (Math.atan2(b, a) * 180) / Math.PI,
  };
}

// Convert OKLCH to OKLAB
export function oklchToOklab({ l, c, h }: OKLCH): OKLAB {
  const rad = (h * Math.PI) / 180;
  return { l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

// Convert OKLAB to Linear RGB
export function oklabToLinearRGB({ l, a, b }: OKLAB): RGB {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lRGB = (x: number) => Math.pow(x, 3);

  return {
    r: lRGB(l_ * 0.412165612 + m_ * 0.536275208 + s_ * 0.0514575653),
    g: lRGB(l_ * 0.211859107 + m_ * 0.6807189584 + s_ * 0.107406579),
    b: lRGB(l_ * 0.0883097947 + m_ * 0.2818474174 + s_ * 0.629841219),
  };
}

// Convert sRGB to OKLAB
export function linearRGBToOklab({ r, g, b }: RGB): OKLAB {
  const toL = (x: number) => Math.cbrt(x);

  const l = toL(0.412165612 * r + 0.536275208 * g + 0.0514575653 * b);
  const m = toL(0.211859107 * r + 0.6807189584 * g + 0.107406579 * b);
  const s = toL(0.0883097947 * r + 0.2818474174 * g + 0.629841219 * b);

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

// Convert HSL to sRGB
export function hslToRgb({ h, s, l }: HSL): RGB {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return { r: f(0), g: f(8), b: f(4) };
}

// Convert sRGB to HSL
export function rgbToHsl({ r, g, b }: RGB): HSL {
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s, l };
}
