import * as yaml from "yaml";
import { fsUtils } from "../../lib/fs.js";

export type RegistryData = Record<string, Omit<RegistryFileData, "id">>;

export type RegistryFileData = {
  id: string;
  path: string;
  type: string;
  hash: string;
};

export class Registry {
  private data: RegistryData = {};

  constructor(private path: string) {}

  async load() {
    if (!(await fsUtils.exist(this.path))) {
      this.data = {};
      return;
    }
    const content = (await fsUtils.read(this.path, "utf8")) ?? "{}";
    this.data = yaml.parse(content);
  }

  async save() {
    const content = yaml.stringify(this.data);
    await fsUtils.write(this.path, content);
  }

  get(id: string): Omit<RegistryFileData, "id"> | undefined {
    return this.data[id];
  }
  set(id: string, fileData: Omit<RegistryFileData, "id">) {
    this.data[id] = fileData;
  }
  remove(id: string) {
    delete this.data[id];
  }
}
