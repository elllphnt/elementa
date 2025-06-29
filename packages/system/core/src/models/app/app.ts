import { AppData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";

export class App extends Model<RecordState<AppData>> {
  readonly file: any; // TODO: Fix typing

  constructor({ state, file }: { state: RecordState<AppData>; file: any }) {
    super({ state });
    this.file = file;
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
