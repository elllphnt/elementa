export const MARKUP_REGEX = /<<([A-Z_]+):(.*?)>>/g;

export type MarkupStruct = {
  __markup: string;
  value: string;
};

export function createTextMarkup(type: string, ref: string): string {
  if (isTextMarkup(ref)) return ref; // Already a reference string
  return `<<${type}:${ref}>>`;
}
export function isTextMarkup(str: string): boolean {
  return new RegExp(MARKUP_REGEX).test(str);
}
export function parseTextMarkups(content: string): MarkupStruct[] {
  const entries: MarkupStruct[] = [];
  let match: RegExpExecArray | null;
  while ((match = MARKUP_REGEX.exec(content)) !== null) {
    entries.push({
      __markup: match[1],
      value: match[2],
    });
  }
  return entries;
}
export async function replaceTextMarkups(
  content: string,
  replace: (markup: MarkupStruct) => string | Promise<string>,
): Promise<string> {
  let result = "";
  let lastIndex = 0;

  for (const match of content.matchAll(MARKUP_REGEX)) {
    const original = match[0];
    const markup: MarkupStruct = {
      __markup: match[1],
      value: match[2],
    };
    const matchIndex = match.index;

    if (matchIndex === undefined) {
      continue; // Skip if index is undefined
    }

    result += content.substring(lastIndex, matchIndex);

    const replacement = await replace(markup);
    if (replacement === undefined) {
      throw new Error(`Reference "${markup}" not found`);
    }
    result += replacement;

    lastIndex = matchIndex + original.length;
  }

  result += content.substring(lastIndex);
  return result;
}

export const markupTypes = {
  file: "FILE",
  staticRef: "STATIC_REF",
};
