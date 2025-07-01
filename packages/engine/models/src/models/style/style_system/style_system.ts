import { StyleSystemData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { ProjectModel } from "~/models/project.js";
import { File } from "~/project/file/file.js";
import { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import { modelsLogger } from "../../../loggers.js";
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

    modelsLogger.info("Creating style system", {
      projectId: project.id,
      initialized: initialized ?? false,
      stylesheetUrlsCount: this.stylesheetUrls.length,
    });

    this.colorSchemes = new ColorSchemeSet({
      state: state.getRecordState("colorSchemes"),
    });

    this.viewports = new ViewportSet({
      state: state.getRecordState("viewports"),
    });

    this.addInitializer(() => {
      modelsLogger.debug("Initializing style system models", {
        projectId: project.id,
        stylesheetUrlsCount: this.stylesheetUrls.length,
        hasColorSchemes: !!this.colorSchemes,
        hasViewports: !!this.viewports,
      });

      this.colorSchemes.initialize();
      this.viewports.initialize();

      this.addDisposer(() => {
        modelsLogger.debug("Disposing style system models", {
          projectId: project.id,
          stylesheetUrlsCount: this.stylesheetUrls.length,
        });
        this.colorSchemes.dispose();
        this.viewports.dispose();
      });
    });
  }

  addStylesheet(url: string): void {
    const stylesheets = this.stylesheetUrls;
    if (!stylesheets.includes(url)) {
      modelsLogger.info("Adding stylesheet to style system", {
        projectId: this.project.id,
        url,
        totalStylesheets: stylesheets.length + 1,
      });
      this.state.set("stylesheetUrls", [...stylesheets, url]);
    } else {
      modelsLogger.warn("Attempted to add duplicate stylesheet", {
        projectId: this.project.id,
        url,
        totalStylesheets: stylesheets.length,
      });
    }
  }

  removeStylesheet(url: string): void {
    const stylesheets = this.stylesheetUrls;
    const filteredStylesheets = stylesheets.filter((s) => s !== url);

    if (filteredStylesheets.length < stylesheets.length) {
      modelsLogger.info("Removing stylesheet from style system", {
        projectId: this.project.id,
        url,
        totalStylesheetsBefore: stylesheets.length,
        totalStylesheetsAfter: filteredStylesheets.length,
      });
    } else {
      modelsLogger.warn("Attempted to remove non-existent stylesheet", {
        projectId: this.project.id,
        url,
        totalStylesheets: stylesheets.length,
      });
    }

    this.state.set("stylesheetUrls", filteredStylesheets);
  }
}
