import { Disposable, keyManager } from "@elllphnt/elementa-utils";
import { ElementRuntimeEnvironment } from "../instances/_.js";
import { DefaultElementRuntimeEnvironment } from "../instances/elements/_environment/default_environment.js";
import { ModuleManager } from "./module_manager/module_manager.js";

export class Runtime extends Disposable {
  key = keyManager.next("runtime");

  readonly moduleManager: ModuleManager;
  readonly fragmentEnvironment: ElementRuntimeEnvironment;

  constructor({ moduleManager }: { moduleManager: ModuleManager }) {
    super();
    this.moduleManager = moduleManager;
    this.fragmentEnvironment = new DefaultElementRuntimeEnvironment({
      runtime: this,
    });

    this.addDisposer(() => {
      this.fragmentEnvironment.dispose();
      this.moduleManager.dispose();
    });
  }
}
