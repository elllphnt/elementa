export const MARKUP_REGEX = /<<([A-Z_]+):(.*?)>>/g;

export type MarkupStruct = {
  type: string;
  value: string;
};

export function createMarkup(type: string, ref: string): string {
  if (isMarkup(ref)) return ref; // Already a reference string
  return `<<${type}:${ref}>>`;
}
export function isMarkup(str: string): boolean {
  return new RegExp(MARKUP_REGEX).test(str);
}
export function parseMarkups(content: string): MarkupStruct[] {
  const entries: MarkupStruct[] = [];
  let match: RegExpExecArray | null;
  while ((match = MARKUP_REGEX.exec(content)) !== null) {
    entries.push({
      type: match[1],
      value: match[2],
    });
  }
  return entries;
}
export async function replaceMarkups(
  content: string,
  replace: (
    markup: MarkupStruct,
  ) => string | undefined | Promise<string | undefined>,
): Promise<string> {
  let result = "";
  let lastIndex = 0;

  for (const match of content.matchAll(MARKUP_REGEX)) {
    const original = match[0];
    const markup: MarkupStruct = {
      type: match[1],
      value: match[2],
    };
    const matchIndex = match.index;

    if (matchIndex === undefined) {
      continue; // Skip if index is undefined
    }

    result += content.substring(lastIndex, matchIndex);

    const replacement = await replace(markup);
    if (replacement === undefined) {
      result += original; // If no replacement, keep the original markup
    } else {
      result += replacement;
    }

    lastIndex = matchIndex + original.length;
  }

  result += content.substring(lastIndex);
  return result;
}

export const markupTypes = {
  staticRef: "STATIC_REF",
  fileRef: "FILE_REF",
};
