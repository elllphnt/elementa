import { AppData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { modelsLogger } from "../../loggers.js";
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
    modelsLogger.info("Creating app", {
      projectId: project.id,
      initialized: initialized ?? false,
      hasRouterUrl: !!this.routerUrl,
      routerUrl: this.routerUrl,
    });
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
    const previousUrl = this.routerUrl;
    modelsLogger.debug("Setting router URL", {
      projectId: this.project.id,
      previousUrl,
      newUrl: url,
      urlChanged: previousUrl !== url,
    });
    this.state.set("routerUrl", url);
    modelsLogger.info("Router URL updated", {
      projectId: this.project.id,
      url,
      previousUrl,
    });
  }
}
