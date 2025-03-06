import { File } from "@repo/backend";
import { StylesheetStore } from "@repo/elementa";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { filter, firstValueFrom, map, of, switchMap, timeout } from "rxjs";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";
import { ElllStylesheet } from "./stylesheet";

const stylesheetDirectoryPath = "stylesheets";

const mimetype = "application/vnd.elll.stylesheet+json";

export class ElllStylesheetStore extends Disposable implements StylesheetStore {
  readonly project: ElllProject;

  private _stylesheets = new Map<File, ElllStylesheet>();

  get elll() {
    return this.project.elll;
  }

  get stylesheetDirectory() {
    return elllFileAtPath(this.elll, stylesheetDirectoryPath, {
      type: "directory",
    });
  }
  get stylesheetDirectory$() {
    return elllFileAtPath$(this.elll, stylesheetDirectoryPath, {
      type: "directory",
    });
  }

  get stylesheetDirectoryEntriesQuery() {
    return this.stylesheetDirectory?.entries({ autoFetch: true });
  }
  get stylesheetDirectoryEntriesQuery$() {
    return this.stylesheetDirectory$.pipe(
      map((directory) => directory?.entries({ autoFetch: true })),
    );
  }

  get stylesheetDirectoryEntries() {
    return this.stylesheetDirectoryEntriesQuery?.data;
  }
  get stylesheetDirectoryEntries$() {
    return this.stylesheetDirectoryEntriesQuery$?.pipe(
      switchMap((entries) => entries?.data$ ?? of(undefined)),
    );
  }

  get stylesheetFiles() {
    return this.stylesheetDirectoryEntries?.filter(
      (entry) => entry.type === mimetype,
    );
  }
  get stylesheetFiles$() {
    return this.stylesheetDirectoryEntries$.pipe(
      switchMap((entries) =>
        combineLatestOrEmpty(
          entries?.map((entry) =>
            entry.type$.pipe(map((type) => ({ entry, type }))),
          ) ?? [],
        ),
      ),
      map((entries) => entries.filter((entry) => entry.type === mimetype)),
      map((entries) => entries.map((entry) => entry.entry)),
    );
  }

  stylesheetFromFile(file: File): ElllStylesheet {
    let stylesheet = this._stylesheets.get(file);
    if (!stylesheet) {
      stylesheet = new ElllStylesheet({
        file,
        elll: this.elll,
        project: this.project as any,
      });
      this._stylesheets.set(file, stylesheet);
    }
    return stylesheet;
  }

  stylesheet(url: string): ElllStylesheet {
    return this.stylesheetFromFile(this.elll.backend.instance(url, true));
  }

  get stylesheets() {
    return (
      this.stylesheetFiles?.map((file) => this.stylesheetFromFile(file)) ?? []
    );
  }
  get stylesheets$() {
    return this.stylesheetFiles$.pipe(
      map((files) => files?.map((file) => this.stylesheetFromFile(file)) ?? []),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    this.addDisposer(() => {
      this._stylesheets.forEach((stylesheet) => stylesheet.dispose());
      this._stylesheets.clear();
    });
  }

  async createStylesheet(name: string) {
    const directory = await firstValueFrom(
      this.stylesheetDirectory$.pipe(filter(Boolean), timeout(5000)),
    );

    const file = await directory.createEntry({
      name,
      type: mimetype,
    });
    if (!file) {
      throw new Error("Failed to create stylesheet file");
    }
    return this.stylesheetFromFile(file);
  }
  async deleteStylesheet(stylesheet: ElllStylesheet) {
    await stylesheet.file.delete();
    this._stylesheets.delete(stylesheet.file);
  }
}
