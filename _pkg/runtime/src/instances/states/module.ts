import { HookConfig } from "@elllphnt/elementa-base";
import { HookState } from "@elllphnt/elementa-models";
import { map, of, switchMap } from "rxjs";
import { Runtime } from "../../runtime/runtime";
import { Instance } from "../instance";
import { StateInstance } from "./state";

export class HookStateInstance extends StateInstance<HookState> {
  get module() {
    const url = this.state.absoluteHookUrl;
    return url ? this.runtime.moduleManager.module(url) : undefined;
  }
  get module$() {
    return this.state.absoluteHookUrl$.pipe(
      switchMap((url) => {
        return url ? this.runtime.moduleManager.module$(url) : of(undefined);
      })
    );
  }

  get use() {
    return this.module?.default;
  }
  get use$() {
    return this.module$.pipe(
      map((module) => {
        return module?.default;
      })
    );
  }

  get config() {
    return this.module?.config as HookConfig | undefined;
  }
  get config$() {
    return this.module$.pipe(
      map((module) => {
        return module?.config as HookConfig | undefined;
      })
    );
  }

  constructor({
    state,
    runtime,
    parent,
  }: {
    state: HookState;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({ state, runtime, parent });
  }
}
