import { NameOptions, Namespace } from "./namespace.js";

export class ImportMap {
  readonly namespace: Namespace;
  private imports: Map<string, Record<string, string>> = new Map();

  constructor({ namespace }: { namespace: Namespace }) {
    this.namespace = namespace;
  }

  import({
    key,
    url,
    specifier,
    name,
  }: {
    key: any;
    url: string;
    specifier?: string;
    name?: NameOptions;
  }): string {
    const imports = this.imports.get(url) || {};
    const _specifier = specifier || "default";
    let _name = imports[_specifier];

    if (!_name) {
      _name = this.namespace.reserveName(key, {
        ...name,
        base: name?.base || specifier,
      });
      imports[_specifier] = _name;
      this.imports.set(url, imports);
      return _name;
    }

    return _name;
  }

  private importToCode(url: string, names: Record<string, string>) {
    const { default: defaultName, ...namedImports } = names;
    const namedImportsCode = Object.entries(namedImports)
      .map(([specifier, name]) => {
        return `${specifier} as ${name}`;
      })
      .join(", ");

    if (defaultName && namedImportsCode) {
      return `import ${defaultName}, { ${namedImportsCode} } from "${url}";`;
    } else if (defaultName) {
      return `import ${defaultName} from "${url}";`;
    } else if (namedImportsCode) {
      return `import { ${namedImportsCode} } from "${url}";`;
    } else {
      return "";
    }
  }

  toCode() {
    return Array.from(this.imports.entries())
      .map(([url, names]) => {
        return this.importToCode(url, names);
      })
      .join("\n");
  }
}
