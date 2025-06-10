import { StyleSystemData } from "@elllphnt/elementa-base";
import {
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, Observable } from "rxjs";
import { ColorSchemeSet, StyleSystem, ViewportSet } from "~/models/style/_.js";
import { File, Project } from "~/project/_.js";
import { StatefulModel } from "../../_base.js";
import { StatefulColorSchemeSet } from "./color_scheme_set.js";
import { StatefulViewportSet } from "./viewport_set.js";

export class StatefulStyleSystem
  extends StatefulModel<StyleSystemData>
  implements StyleSystem
{
  project: Project;
  colorSchemes: ColorSchemeSet;
  viewports: ViewportSet;

  private _state: RecordState<
    Omit<StyleSystemData, "colorSchemes" | "viewports">
  >;

  get stylesheets(): string[] {
    return this._state.entry("stylesheets") || [];
  }

  get stylesheets$(): Observable<string[]> {
    return this._state.entry$("stylesheets");
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
      init: colorSchemes || { source: "system" },
    });

    this.viewports = new StatefulViewportSet({
      init: viewports || { source: "breakpoints" },
    });

    this.addDisposer(() => {
      this._state.dispose();
      this.colorSchemes.dispose();
      this.viewports.dispose();
    });
  }

  addStylesheet(id: string): void {
    const stylesheets = this.stylesheets;
    if (!stylesheets.includes(id)) {
      this._state.setEntry("stylesheets", [...stylesheets, id]);
    }
  }

  removeStylesheet(id: string): void {
    const stylesheets = this.stylesheets;
    this._state.setEntry(
      "stylesheets",
      stylesheets.filter((s) => s !== id)
    );
  }

  restore(data: StyleSystemData): void {
    const { colorSchemes, viewports, ...stateData } = data;
    this._state.setRecord(stateData);
    this.colorSchemes.restore(colorSchemes || { source: "system" });
    this.viewports.restore(viewports || { source: "breakpoints" });
  }
}
