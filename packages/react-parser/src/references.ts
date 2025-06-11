export const REFERENCE_REGEX = /<<REF:(.*?)>>/g;
export function createReferenceString(ref: string): string {
  return `<<REF:${ref}>>`;
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
  replace: (ref: string) => string
): string {
  return content.replace(REFERENCE_REGEX, (_, ref) => {
    const replacement = replace(ref);
    if (replacement === undefined) {
      throw new Error(`Reference "${ref}" not found`);
    }
    return replacement;
  });
}
