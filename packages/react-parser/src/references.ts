export const REFERENCE_REGEX = /<<REF:(.*?)>>/g;
export function createReferenceString(ref: string): string {
  if (isReferenceString(ref)) return ref; // Already a reference string
  return `<<REF:${ref}>>`;
}
export function isReferenceString(str: string): boolean {
  return new RegExp(REFERENCE_REGEX).test(str);
}
export function parseReferences(content: string): string[] {
  const references: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = REFERENCE_REGEX.exec(content)) !== null) {
    references.push(match[1]);
  }
  return references;
}
export function replaceReferences(
  content: string,
  replace: (ref: string) => string,
  filter?: (ref: string) => boolean
): string {
  return content.replace(REFERENCE_REGEX, (original, ref) => {
    if (filter && !filter(ref)) {
      return original; // Skip replacement if filter is provided and does not match
    }

    const replacement = replace(ref);
    if (replacement === undefined) {
      throw new Error(`Reference "${ref}" not found`);
    }
    return replacement;
  });
}
