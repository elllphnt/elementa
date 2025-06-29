import { AppData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";

export class App extends Model<RecordState<AppData>> {
  constructor({ state }: { state: RecordState<AppData> }) {
    super({ state });
  }

  get routerUrl(): string | undefined {
    return this.state.entry("routerUrl");
  }

  get routerUrl$(): Observable<string | undefined> {
    return this.state.entry$("routerUrl");
  }

  get router(): any {
    // TODO: Fix typing
    return undefined;
  }

  get router$(): Observable<any> {
    // TODO: Fix typing
    return this.state.entry$("routerUrl");
  }

  setRouterUrl(url: string | undefined): void {
    this.state.set("routerUrl", url);
  }
}
