import { AppData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { ProjectModel } from "../project.js";

export class App extends ProjectModel<RecordState<AppData>> {
  constructor({
    state,
    project,
    initialized,
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
    return undefined;
  }
  get router$() {
    return this.state.entry$("routerUrl");
  }

  setRouterUrl(url: string | undefined): void {
    this.state.set("routerUrl", url);
  }
}
