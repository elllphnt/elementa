export const FILE_REFERENCE_REGEX = /<<REF:(.*?)>>/g;

export function createFileReferenceString(ref: string): string {
  if (isFileReferenceString(ref)) return ref; // Already a reference string
  return `<<REF:${ref}>>`;
}

export function isFileReferenceString(str: string): boolean {
  return new RegExp(FILE_REFERENCE_REGEX).test(str);
}

export function parseFileReferences(content: string): string[] {
  const references: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = FILE_REFERENCE_REGEX.exec(content)) !== null) {
    references.push(match[1]);
  }
  return references;
}

export async function replaceFileReferences(
  content: string,
  replace: (ref: string) => string | Promise<string>,
  filter?: (ref: string) => boolean
): Promise<string> {
  let result = "";
  let lastIndex = 0;

  for (const match of content.matchAll(FILE_REFERENCE_REGEX)) {
    const original = match[0];
    const ref = match[1];
    const matchIndex = match.index;

    if (matchIndex === undefined) {
      continue; // Skip if index is undefined
    }

    result += content.substring(lastIndex, matchIndex);

    if (filter && !filter(ref)) {
      result += original; // Skip replacement if filter is provided and does not match
    } else {
      const replacement = await replace(ref);
      if (replacement === undefined) {
        throw new Error(`Reference "${ref}" not found`);
      }
      result += replacement;
    }

    lastIndex = matchIndex + original.length;
  }

  result += content.substring(lastIndex);
  return result;
}
