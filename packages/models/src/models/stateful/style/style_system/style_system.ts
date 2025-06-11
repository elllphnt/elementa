import { StyleSystemData } from "@elllphnt/elementa-base";
import {
  File,
  FileModelAdaptor,
  Project,
  StyleSystem,
} from "@elllphnt/elementa-core";
import {
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";
import { StatefulColorSchemeSet } from "./color_scheme_set.js";
import { StatefulViewportSet } from "./viewport_set.js";

export class StatefulStyleSystem
  extends StatefulModel<StyleSystemData>
  implements StyleSystem
{
  project: Project;
  colorSchemes: StatefulColorSchemeSet;
  viewports: StatefulViewportSet;

  private _state: RecordState<
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

  get data(): StyleSystemData {
    return {
      ...this._state.record,
      colorSchemes: this.colorSchemes.data,
      viewports: this.viewports.data,
    };
  }

  get data$(): Observable<StyleSystemData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        colorSchemes: this.colorSchemes.data$,
        viewports: this.viewports.data$,
      }),
    ]);
  }

  constructor({ init, file }: { init: StyleSystemData; file: File }) {
    const { colorSchemes, viewports, ...stateData } = init;
    super({ key: keyManager.next("style-system") });

    this.project = file.project;

    this._state = new RecordState({
      init: stateData,
    });

    this.colorSchemes = new StatefulColorSchemeSet({
      init: colorSchemes || {
        source: "system",
        __crdtAtomic: ["definitions[*]"],
      },
    });

    this.viewports = new StatefulViewportSet({
      init: viewports || {
        source: "breakpoints",
        __crdtAtomic: ["definitions[*]"],
      },
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

  restore(data: StyleSystemData): void {
    const { colorSchemes, viewports, ...stateData } = data;
    this._state.setRecord(stateData);
    this.colorSchemes.restore(
      colorSchemes || { source: "system", __crdtAtomic: ["definitions[*]"] }
    );
    this.viewports.restore(
      viewports || { source: "breakpoints", __crdtAtomic: ["definitions[*]"] }
    );
  }
}
