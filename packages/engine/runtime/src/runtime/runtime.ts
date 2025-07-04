import { keyManager, Lifecycle } from "@elllphnt/elementa-kernel";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
import { DefaultElementRuntimeEnvironment } from "../instances/elements/_environment/default_environment.js";
import type { ModuleManager } from "./module_manager/module_manager.js";

export class Runtime extends Lifecycle {
  key = keyManager.next("runtime");

  readonly moduleManager: ModuleManager;
  readonly fragmentEnvironment: ElementRuntimeEnvironment;

  constructor({ moduleManager }: { moduleManager: ModuleManager }) {
    super();
    this.moduleManager = moduleManager;
    this.fragmentEnvironment = new DefaultElementRuntimeEnvironment({
      runtime: this,
    });

    this.addLifecycle(this.fragmentEnvironment);

    this.addDisposer(() => {
      this.fragmentEnvironment.dispose();
      this.moduleManager.dispose();
    });
  }
}
