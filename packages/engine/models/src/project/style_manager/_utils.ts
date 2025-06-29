import { ViewportDefinitionData } from "@elllphnt/elementa-base";

// ----------------- VIEWPORT MATCHING FUNCTION -----------------
export function matchViewport({
  height,
  width,
  viewport,
}: {
  height?: number;
  width?: number;
  viewport: ViewportDefinitionData;
}): boolean {
  // Check width boundaries
  if (width !== undefined && viewport.width) {
    const [minWidth, maxWidth] = viewport.width;
    if (minWidth !== null && width < minWidth) return false;
    if (maxWidth !== null && width > maxWidth) return false;
  }
  // Check height boundaries
  if (height !== undefined && viewport.height) {
    const [minHeight, maxHeight] = viewport.height;
    if (minHeight !== null && height < minHeight) return false;
    if (maxHeight !== null && height > maxHeight) return false;
  }
  // Check ratio boundaries if both dimensions are available
  if (width !== undefined && height !== undefined && viewport.ratio) {
    const [minRatio, maxRatio] = viewport.ratio;
    const actualRatio = width / height;
    if (minRatio !== null && actualRatio < minRatio) return false;
    if (maxRatio !== null && actualRatio > maxRatio) return false;
  }
  return true;
}

/**
 * Simple DJB2 hash to a 32-bit integer.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // >>>0 to force unsigned 32-bit
  return hash >>> 0;
}

/**
 * Sanitize arbitrary input into a valid CSS identifier base:
 * - lowercase, trim
 * - replace invalid chars with '-'
 * - ensure it starts with a letter or underscore
 * - collapse repeated separators
 */
function sanitizeBase(input: string): string {
  let base = input.trim().toLowerCase();
  // replace anything _not_ [a-z0-9_-] with '-'
  base = base.replace(/[^a-z0-9_-]+/g, "-");
  // ensure leading letter or underscore
  if (!/^[a-z_]/.test(base)) {
    base = `_${base}`;
  }
  // collapse multiple '-' or '_' into single
  base = base.replace(/[-_]{2,}/g, (sep) => sep[0]);
  // fallback if emptied out
  if (!base) base = "_";
  return base;
}

/**
 * Deterministically generate a unique CSS class name from any string.
 * The same input → same output; different inputs → extremely unlikely collisions.
 */
export function generateClassName(input: string): string {
  const base = sanitizeBase(input);
  const hash = djb2Hash(input).toString(36); // base36 suffix
  return `${base}-${hash}`;
}
