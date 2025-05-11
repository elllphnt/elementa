import { HookConfig } from "@elllphnt/elementa-base";
import { HookState } from "@elllphnt/elementa-models";
import { map, of } from "rxjs";
import { Runtime } from "../../runtime/runtime.js";
import { Instance } from "../instance.js";
import { StateInstance } from "./state.js";

export class HookStateInstance extends StateInstance<HookState> {
  get module() {
    const url = this.model.absoluteHookUrl;
    return url ? this.runtime.moduleManager.module(url) : undefined;
  }

  get use() {
    return this.module?.value.default;
  }
  get use$() {
    return (
      this.module?.value$.pipe(
        map((module) => {
          return module?.default;
        })
      ) ?? of(undefined)
    );
  }

  get config() {
    return this.module?.value.config as HookConfig | undefined;
  }
  get config$() {
    return (
      this.module?.value$.pipe(
        map((value) => {
          return value?.config as HookConfig | undefined;
        })
      ) ?? of(undefined)
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
