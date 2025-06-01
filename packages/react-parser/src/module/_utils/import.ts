export function generateImportStatements(
  importMap: Record<string, Record<string, string>>
): string {
  const lines: string[] = [];

  for (const [source, specifiers] of Object.entries(importMap)) {
    const namedImports: string[] = [];
    let defaultImport: string | undefined;
    let namespaceImport: string | undefined;

    for (const [specifier, alias] of Object.entries(specifiers)) {
      if (specifier === "default") {
        defaultImport = alias;
      } else if (specifier === "*") {
        namespaceImport = alias;
      } else {
        namedImports.push(
          specifier === alias ? specifier : `${specifier} as ${alias}`
        );
      }
    }

    let line = "import ";
    const parts: string[] = [];

    if (defaultImport) parts.push(defaultImport);
    if (namespaceImport) parts.push(`* as ${namespaceImport}`);
    if (namedImports.length) parts.push(`{ ${namedImports.join(", ")} }`);

    line += parts.join(", ") + ` from "${source}";`;
    lines.push(line);
  }

  return lines.join("\n");
}
