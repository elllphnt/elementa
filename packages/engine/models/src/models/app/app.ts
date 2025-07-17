import type { AppData, ImportReference } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { map } from "rxjs";
import type { Project } from "~/project/project.js";
import { ProjectModel } from "../project.js";

export class App extends ProjectModel<RecordState<AppData>> {
  constructor({
    state,
    project,
  }: {
    state: RecordState<AppData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });
  }

  get routerRef() {
    return this.state.entry("routerRef");
  }
  get routerRef$() {
    return this.state.entry$("routerRef");
  }

  get router() {
    return this.routerRef
      ? this.project.infrastructure.router(
          this.project.absoluteFileUrl(this.routerRef.__import.module)
        )
      : undefined;
  }
  get router$() {
    return this.routerRef$.pipe(
      map((url) =>
        url
          ? this.project.infrastructure.router(
              this.project.absoluteFileUrl(url.__import.module)
            )
          : undefined
      )
    );
  }

  setRouterRef(ref: ImportReference | undefined): void {
    this.state.set("routerRef", ref);
  }
}
