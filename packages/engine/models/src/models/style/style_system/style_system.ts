import { StyleSystemData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { ProjectModel } from "~/models/project.js";
import { File } from "~/project/file/file.js";
import { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import { ColorSchemeSet } from "./color_scheme_set.js";
import { ViewportSet } from "./viewport_set.js";

export class StyleSystem extends ProjectModel<RecordState<StyleSystemData>> {
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
    project,
    initialized,
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
