export const trimHtmlText = (text: string) =>
  text
    .replace(/^\s+/, (match) => (match ? " " : ""))
    .replace(/\s+$/, (match) => (match ? " " : ""));
