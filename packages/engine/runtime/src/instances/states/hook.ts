import type { HookConfig } from "@elllphnt/elementa-base";
import type { HookState } from "@elllphnt/elementa-models";
import { map, of } from "rxjs";
import type { Runtime } from "../../runtime/runtime.js";
import type { Instance } from "../instance.js";
import { BaseStateInstance } from "./_base.js";

export class HookStateInstance extends BaseStateInstance<HookState> {
  get module() {
    return this.model.hookUrl
      ? this.runtime.moduleManager.module(
          this.model.component.project.absoluteFileUrl(this.model.hookUrl)
        )
      : undefined;
  }

  get use() {
    return this.module?.value?.default;
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
    model,
    runtime,
    parent,
  }: {
    model: HookState;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({ model, runtime, parent });
  }
}
