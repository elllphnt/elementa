import type { ImportReference, StyleSystemData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import { ProjectModel } from "~/models/project.js";
import type { File } from "~/project/file/file.js";
import type { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import { ColorSchemeSet } from "./color_scheme_set.js";
import { ViewportSet } from "./viewport_set.js";

export class StyleSystem extends ProjectModel<RecordState<StyleSystemData>> {
  colorSchemes: ColorSchemeSet;
  viewports: ViewportSet;

  get stylesheetRefs(): ImportReference[] {
    return this.state.entry("stylesheetRefs") || [];
  }
  get stylesheetRefs$(): Observable<ImportReference[]> {
    return this.state.entry$("stylesheetRefs").pipe(map((urls) => urls || []));
  }

  get stylesheets(): FileModelAdaptor<"stylesheet", File>[] {
    return this.stylesheetRefs.map((ref) =>
      this.project.stylesheet(this.project.absoluteFileUrl(ref.__import.module))
    );
  }
  get stylesheets$(): Observable<FileModelAdaptor<"stylesheet", File>[]> {
    return this.stylesheetRefs$.pipe(
      map((refs) =>
        refs.map((ref) =>
          this.project.stylesheet(
            this.project.absoluteFileUrl(ref.__import.module)
          )
        )
      )
    );
  }

  constructor({
    state,
    project,
  }: {
    state: RecordState<StyleSystemData>;
    project: any;
    initialized?: boolean;
  }) {
    super({ state, project });

    this.colorSchemes = new ColorSchemeSet({
      state: state.getRecordState("colorSchemes"),
    });

    this.viewports = new ViewportSet({
      state: state.getRecordState("viewports"),
    });

    this.addInitializer(() => {
      this.colorSchemes.initialize();
      this.viewports.initialize();

      this.addDisposer(() => {
        this.colorSchemes.dispose();
        this.viewports.dispose();
      });
    });
  }

  addStylesheet(ref: ImportReference): void {
    const stylesheets = this.stylesheetRefs;
    this.state.set("stylesheetRefs", [...stylesheets, ref]);
  }

  removeStylesheet(ref: ImportReference): void {
    const stylesheets = this.stylesheetRefs;
    const filteredStylesheets = stylesheets.filter((s) => {
      return (
        s.__import.module !== ref.__import.module ||
        s.__import.name !== ref.__import.name
      );
    });
    this.state.set("stylesheetRefs", filteredStylesheets);
  }
}
