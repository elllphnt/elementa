import { AppData } from "@elllphnt/elementa-base";
import { App, File, FileModelAdaptor } from "@elllphnt/elementa-core";
import { RecordState } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { StatefulModel } from "../_base.js";

export class StatefulApp extends StatefulModel<AppData> implements App {
  // private properties
  private _state: RecordState<AppData>;
  readonly file: File;

  constructor({ init, file }: { init: AppData; file: File }) {
    super();
    this.file = file;

    this._state = new RecordState({
      init,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get routerUrl(): string | undefined {
    return this._state.entry("routerUrl");
  }

  get routerUrl$(): Observable<string | undefined> {
    return this._state.entry$("routerUrl");
  }

  get router(): FileModelAdaptor<"router"> | undefined {
    return this.routerUrl
      ? this.file.project.infrastructure.router(
          this.file.project.absoluteFileUrl(this.routerUrl)
        )
      : undefined;
  }

  get router$(): Observable<FileModelAdaptor<"router"> | undefined> {
    return this.routerUrl$.pipe(
      map((url) =>
        url
          ? this.file.project.infrastructure.router(
              this.file.project.absoluteFileUrl(url)
            )
          : undefined
      )
    );
  }

  get data(): AppData {
    return this._state.record;
  }

  get data$(): Observable<AppData> {
    return this._state.record$;
  }

  setRouterUrl(url: string | undefined): void {
    this._state.set("routerUrl", url);
  }

  restore(data: AppData): void {
    this._state.setRecord(data);
  }
}
