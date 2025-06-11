import { ensureField, getOrCreateYMap } from "@elllphnt/crdt";
import { StyleSystemData } from "@elllphnt/elementa-base";
import {
  File,
  FileModelAdaptor,
  Project,
  StyleSystem,
} from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtColorSchemeSet } from "./color_scheme_set.js";
import { CrdtViewportSet } from "./viewport_set.js";

export class CrdtStyleSystem
  extends CrdtModel<y.Map<any>>
  implements StyleSystem
{
  project: Project;
  file: File;
  colorSchemes: CrdtColorSchemeSet;
  viewports: CrdtViewportSet;

  private _state: CrdtRecordState<
    Omit<StyleSystemData, "colorSchemes" | "viewports">
  >;

  get stylesheetUrls(): string[] {
    return this._state.entry("stylesheetUrls") || [];
  }

  get stylesheetUrls$(): Observable<string[]> {
    return this._state.entry$("stylesheetUrls").pipe(map((urls) => urls || []));
  }

  get stylesheets(): FileModelAdaptor<"stylesheet", File>[] {
    return this.stylesheetUrls.map((url) =>
      this.project.stylesheet(this.project.absoluteFileUrl(url))
    );
  }

  get stylesheets$(): Observable<FileModelAdaptor<"stylesheet", File>[]> {
    return this.stylesheetUrls$.pipe(
      map((urls) =>
        urls.map((url) =>
          this.project.stylesheet(this.project.absoluteFileUrl(url))
        )
      )
    );
  }

  constructor({
    crdt,
    file,
    initialized,
  }: {
    crdt: y.Map<any>;
    file: File;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("style-system"), crdt });

    this.project = file.project;
    this.file = file;

    if (!initialized) {
      ensureField(crdt, "stylesheetUrls", () => []);
      ensureField(crdt, "colorSchemes", () => new y.Map());
      ensureField(crdt, "viewports", () => new y.Map());
    }

    this._state = new CrdtRecordState(crdt);

    this.colorSchemes = new CrdtColorSchemeSet({
      crdt: getOrCreateYMap(crdt, "colorSchemes"),
      initialized,
    });

    this.viewports = new CrdtViewportSet({
      crdt: getOrCreateYMap(crdt, "viewports"),
      initialized,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this.colorSchemes.dispose();
      this.viewports.dispose();
    });
  }

  addStylesheet(url: string): void {
    const stylesheets = this.stylesheetUrls;
    if (!stylesheets.includes(url)) {
      this._state.set("stylesheetUrls", [...stylesheets, url]);
    }
  }

  removeStylesheet(url: string): void {
    const stylesheets = this.stylesheetUrls;
    this._state.set(
      "stylesheetUrls",
      stylesheets.filter((s) => s !== url)
    );
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtStyleSystem({
      crdt,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
