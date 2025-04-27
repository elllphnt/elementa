export function populateTemplateString(
  template: string,
  args: string[]
): string {
  return template.replace(/\$(\d+)/g, (_, group) => {
    const index = parseInt(group, 10);
    const arg = args[index - 1];
    return arg !== undefined ? arg : "";
  });
}
