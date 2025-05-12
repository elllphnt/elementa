import { isProd } from "./env.js";

/**
 * Assert a condition: throws in dev, logs in prod.
 */
export function assert(
  condition: any,
  message: string = "Invariant violation"
): asserts condition {
  if (!condition) {
    const errorMsg = `Invariant failed: ${message}`;
    if (isProd) {
      console.error(errorMsg);
    } else {
      throw new Error(errorMsg);
    }
  }
}
