export type KeyMapping = {
  key: string;
  command: string;
};

export class KeyMapper {
  static stringOf(event: KeyboardEvent) {
    const str = [] as string[];
    if (event.ctrlKey) str.push("ctrl");
    if (event.shiftKey) str.push("shift");
    if (event.altKey) str.push("alt");
    if (event.metaKey) str.push("meta");
    str.push(event.key);

    return str.join("+").toLowerCase();
  }

  private _registry: Map<string, KeyMapping> = new Map();

  constructor({ keymap }: { keymap?: KeyMapping[] } = {}) {
    this._registry = new Map(keymap?.map((mapping) => [mapping.key, mapping]));
  }

  get(key: string) {
    return this._registry.get(key);
  }
  set(keyMapping: KeyMapping) {
    const key = keyMapping.key.toLowerCase();
    this._registry.set(key, {
      ...keyMapping,
      key,
    });
  }
  delete(key: string) {
    this._registry.delete(key);
  }
}
