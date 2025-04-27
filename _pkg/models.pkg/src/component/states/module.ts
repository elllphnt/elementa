import { Expression, HookStateData } from "@elllphnt/elll-element";
import { map } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { State } from "./state";

export class HookState extends State<HookStateData> {
  get hookUrl() {
    return this.state.hookUrl;
  }
  get hookUrl$() {
    return this.state$.pipe(map((s) => s.hookUrl));
  }

  get absoluteHookUrl() {
    return this.hookUrl
      ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
          this.component.url,
          this.hookUrl,
        )
      : undefined;
  }
  get absoluteHookUrl$() {
    return this.hookUrl$.pipe(
      map((url) => {
        return url
          ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
              this.component.url,
              url,
            )
          : undefined;
      }),
    );
  }

  get args() {
    return this.state.args ?? [];
  }
  get args$() {
    return this.state$.pipe(map((s) => s.args ?? []));
  }
  arg(index: number) {
    return this.args[index];
  }
  arg$(index: number) {
    return this.args$.pipe(map((args) => args[index]));
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);
  }

  setArg(index: number, parameter: Expression) {
    const args = [...this.args];
    args[index] = parameter;
    this.patch({ args });
  }
  setHookUrl(hookUrl: string | undefined) {
    this.patch({ hookUrl });
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
  }
}
