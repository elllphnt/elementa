import { StyleSystemData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { File, FileModelAdaptor, Project } from "~/project/_.js";
import { ColorSchemeSet } from "./color_scheme_set.js";
import { ViewportSet } from "./viewport_set.js";

export class StyleSystem extends Model<RecordState<StyleSystemData>> {
  project: Project;
  file: File;
  colorSchemes: ColorSchemeSet;
  viewports: ViewportSet;

  get stylesheetUrls(): string[] {
    return this.state.entry("stylesheetUrls") || [];
  }
  get stylesheetUrls$(): Observable<string[]> {
    return this.state.entry$("stylesheetUrls").pipe(map((urls) => urls || []));
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
    state,
    file,
  }: {
    state: RecordState<StyleSystemData>;
    file: File;
  }) {
    super({ state });

    this.project = file.project;
    this.file = file;

    this.colorSchemes = new ColorSchemeSet({
      state: state.getRecordState("colorSchemes"),
    });

    this.viewports = new ViewportSet({
      state: state.getRecordState("viewports"),
    });

    this.addDisposer(() => {
      this.state.dispose();
      this.colorSchemes.dispose();
      this.viewports.dispose();
    });
  }

  addStylesheet(url: string): void {
    const stylesheets = this.stylesheetUrls;
    if (!stylesheets.includes(url)) {
      this.state.set("stylesheetUrls", [...stylesheets, url]);
    }
  }

  removeStylesheet(url: string): void {
    const stylesheets = this.stylesheetUrls;
    this.state.set(
      "stylesheetUrls",
      stylesheets.filter((s) => s !== url)
    );
  }
}
