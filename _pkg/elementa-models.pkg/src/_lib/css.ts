export function toCssSafeClassName(str: string): string {
  if (str.length === 0) return "c0";

  let big: bigint = 0n;
  // Convert the string into a BigInt by treating it as a sequence of bytes.
  for (let i = 0; i < str.length; i++) {
    big = (big << 8n) + BigInt(str.charCodeAt(i));
  }

  const base: bigint = 62n;
  const alphabet: string =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let encoded: string = "";

  // Convert the BigInt to a base62 string.
  while (big > 0n) {
    const remainder: bigint = big % base;
    encoded = alphabet[Number(remainder)] + encoded;
    big = big / base;
  }

  // Prefix with 'c' to ensure the classname starts with a letter.
  return "c" + encoded;
}
