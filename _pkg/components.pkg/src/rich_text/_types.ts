export type RichText = string | RichTextParagraph[];

export type RichTextParagraph = {
  content: string | RichTextSpan[];
  style?: RichTextStyle;
};

export type RichTextSpan = {
  content: string;
  style?: RichTextStyle;
};

export type RichTextStyle = {
  variant?: "h1" | "h2" | "h3" | "body";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string; // e.g. "red-500", "#ff0000", "blue-700", etc.
};
