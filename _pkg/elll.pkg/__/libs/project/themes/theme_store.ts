import { File } from "@repo/backend";
import { ThemeStore } from "@repo/elementa";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { map, of, switchMap } from "rxjs";
import { ElllProject } from "../project";
import { ElllTheme } from "./theme";
import { elllFileTypes } from "@elllphnt/utils";

const themeDirectoryPath = "themes";

export class ElllThemeStore extends Disposable implements ThemeStore {
  readonly project: ElllProject;

  private _themes = new Map<File, ElllTheme>();

  get elll() {
    return this.project.elll;
  }

  get themeDirectoryQuery() {
    return this.elll.workspace?.fileAtPath(themeDirectoryPath, {
      autoFetch: true,
      create: { type: "directory" },
    });
  }
  get themeDirectoryQuery$() {
    return this.elll.workspace$.pipe(
      map((workspace) => {
        return workspace?.fileAtPath(themeDirectoryPath, {
          autoFetch: true,
          create: { type: "directory" },
        });
      }),
    );
  }

  get themeDirectory() {
    return this.themeDirectoryQuery?.data;
  }
  get themeDirectory$() {
    return this.themeDirectoryQuery$?.pipe(
      switchMap((file) => file?.data$ ?? of(undefined)),
    );
  }

  get themeDirectoryEntriesQuery() {
    return this.themeDirectory?.entries({ autoFetch: true });
  }
  get themeDirectoryEntriesQuery$() {
    return this.themeDirectory$.pipe(
      map((directory) => directory?.entries({ autoFetch: true })),
    );
  }

  get themeDirectoryEntries() {
    return this.themeDirectoryEntriesQuery?.data;
  }
  get themeDirectoryEntries$() {
    return this.themeDirectoryEntriesQuery$?.pipe(
      switchMap((entries) => entries?.data$ ?? of(undefined)),
    );
  }

  get themeFiles() {
    return this.themeDirectoryEntries?.filter(
      (entry) => entry.type === elllFileTypes.theme,
    );
  }
  get themeFiles$() {
    return this.themeDirectoryEntries$.pipe(
      switchMap((entries) =>
        combineLatestOrEmpty(
          entries?.map((entry) =>
            entry.type$.pipe(map((type) => ({ entry, type }))),
          ) ?? [],
        ),
      ),
      map((entries) =>
        entries.filter((entry) => entry.type === elllFileTypes.theme),
      ),
      map((entries) => entries.map((entry) => entry.entry)),
    );
  }

  themeFromFile(file: File): ElllTheme {
    let theme = this._themes.get(file);
    if (!theme) {
      theme = new ElllTheme({
        file,
        elll: this.elll,
        project: this.project,
      });
      this._themes.set(file, theme);
    }
    return theme;
  }

  theme(url: string): ElllTheme {
    return this.themeFromFile(
      this.project.fileFromResourceUrl(this.project.urlToResourceUrl(url)),
    );
  }

  get themes() {
    return this.themeFiles?.map((file) => this.themeFromFile(file)) ?? [];
  }
  get themes$() {
    return this.themeFiles$.pipe(
      map((files) => files?.map((file) => this.themeFromFile(file)) ?? []),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    this.addDisposer(() => {
      this._themes.forEach((theme) => theme.dispose());
      this._themes.clear();
    });
  }

  async createTheme(name: string) {
    await this.themeDirectoryQuery?.fetch();
    const directory = this.themeDirectoryQuery?.data;
    if (!directory) {
      throw new Error("Theme directory not found");
    }

    const file = await directory.createEntry({
      name,
      type: elllFileTypes.theme,
    });
    return this.themeFromFile(file);
  }
  async deleteTheme(theme: ElllTheme) {
    await theme.file.delete();
    this._themes.delete(theme.file);
  }
}
