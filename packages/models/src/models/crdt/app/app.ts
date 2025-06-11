import { AppData } from "@elllphnt/elementa-base";
import { App, File, FileModelAdaptor } from "@elllphnt/elementa-core";
import { CrdtModel, CrdtRecordState } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import * as y from "yjs";

export class CrdtApp extends CrdtModel<y.Map<any>> implements App {
  // private properties
  private _state: CrdtRecordState<AppData>;
  readonly file: File;

  constructor({
    crdt,
    file,
  }: {
    crdt: y.Map<any>;
    file: File;
    initialized?: boolean;
  }) {
    super({ crdt });
    this.file = file;

    this._state = new CrdtRecordState<AppData>(crdt);

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

  setRouterUrl(url: string | undefined): void {
    this._state.set("routerUrl", url);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtApp({
      crdt,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
