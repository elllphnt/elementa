export function assert(
  condition: any,
  message: string = "Invariant violation"
): asserts condition {
  if (!condition) {
    const errorMsg = `Invariant failed: ${message}`;
    throw new Error(errorMsg);
  }
}
