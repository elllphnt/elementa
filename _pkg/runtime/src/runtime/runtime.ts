import { Disposable, keyManager } from "@elllphnt/elementa-utils";
import { FragmentEnvironment } from "../instances/_";
import { DefaultFragmentEnvironment } from "../instances/fragment/environment/default_environment";
import { ModuleManager } from "./module_manager/module_manager";

export class Runtime extends Disposable {
  key = keyManager.next("runtime");

  readonly moduleManager: ModuleManager;
  readonly fragmentEnvironment: FragmentEnvironment;

  constructor({ moduleManager }: { moduleManager: ModuleManager }) {
    super();
    this.moduleManager = moduleManager;
    this.fragmentEnvironment = new DefaultFragmentEnvironment({
      runtime: this,
    });

    this.addDisposer(() => {
      this.fragmentEnvironment.dispose();
      this.moduleManager.dispose();
    });
  }
}
