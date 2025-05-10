export type NameOptions = {
  base?: string;
  capitalize?: boolean;
};
export class Namespace<K = any> {
  private names: Set<string> = new Set();
  private map = new Map<K, string>();

  reserveName(key: K, { base, capitalize }: NameOptions = {}) {
    let name = base || "variable";
    if (capitalize) {
      name = name[0].toUpperCase() + name.slice(1);
    }
    if (this.names.has(name)) {
      let i = 1;
      while (this.names.has(`${name}_${i}`)) {
        i++;
      }
      name = `${name}_${i}`;
    }
    this.names.add(name);
    this.map.set(key, name);
    return name;
  }
  getName(key: K) {
    return this.map.get(key);
  }
}
