export function generateHandlerScript({
  handlerUrl,
}: {
  handlerUrl: string;
}): string {
  return [`export { default } from "${handlerUrl}";`].join("\n");
}
