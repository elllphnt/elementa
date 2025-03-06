import {
  ComponentManager,
  FileManager,
  Project,
  StyleManager,
} from "@repo/elementa-models";
import { IElll } from "~/src/types/elll";

const projectFilePath = ".elll/project";

export class ElllProject extends Project {
  get styleManager(): StyleManager {
    throw new Error("Method not implemented.");
  }
  get componentManager(): ComponentManager {
    throw new Error("Method not implemented.");
  }
  get fileManager(): FileManager {
    throw new Error("Method not implemented.");
  }
  readonly elll: IElll;

  constructor({ elll }: { elll: IElll }) {
    super();
    this.elll = elll;

    this.addDisposer(() => {});
  }
}
