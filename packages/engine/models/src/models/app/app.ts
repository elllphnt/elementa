import type { AppData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { map, type Observable } from "rxjs";
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

  get routerUrl(): string | undefined {
    return this.state.entry("routerUrl");
  }
  get routerUrl$(): Observable<string | undefined> {
    return this.state.entry$("routerUrl");
  }

  get router() {
    return this.routerUrl
      ? this.project.infrastructure.router(
          this.project.absoluteFileUrl(this.routerUrl)
        )
      : undefined;
  }
  get router$() {
    return this.routerUrl$.pipe(
      map((url) =>
        url
          ? this.project.infrastructure.router(
              this.project.absoluteFileUrl(url)
            )
          : undefined
      )
    );
  }

  setRouterUrl(url: string | undefined): void {
    this.state.set("routerUrl", url);
  }
}
