import { makeFidUrl } from "@elllphnt/utils";
import { File, parseElllResourceUrl } from "@repo/backend";
import { Project, Theme, ThemeData } from "@repo/elementa";
import { Observable, debounceTime, map, of } from "rxjs";
import { Elll } from "../../../elll/elll";
import { Persistor } from "../../persitor";
import { nameFromPath } from "../../utils";

export class ElllTheme extends Theme {
  readonly elll: Elll;
  readonly file: File;
  readonly persitor: Persistor<ThemeData>;

  get url() {
    const fileUrl = this.file.url;
    const { type } = parseElllResourceUrl(fileUrl);
    switch (type) {
      case "workspace-file":
        return makeFidUrl({ id: this.file.fid });
      default:
        return fileUrl;
    }
  }

  get name(): string {
    const path = this.file.path;
    return path === undefined ? "" : nameFromPath(path);
  }
  get name$(): Observable<string> {
    return this.file.path$.pipe(
      map((path) => (path === undefined ? "" : nameFromPath(path))),
    );
  }

  get loaded() {
    return this.persitor.loaded;
  }
  get loaded$() {
    return this.persitor.loaded$;
  }

  constructor({
    file,
    elll,
    project,
  }: {
    file: File;
    elll: Elll;
    project: Project;
  }) {
    super({ id: file.fid, project });
    this.elll = elll;
    this.file = file;

    this.persitor = new Persistor<ThemeData>({
      elll: this.elll,
      resolveFile: () => this.file,
      resolveFile$: () => of(this.file),
    });

    // load the theme data
    const dataSubscription = this.persitor.data$.subscribe((data) => {
      this.restore(data);
    });
    if (this.persitor.data) {
      this.restore(this.persitor.data);
    }
    // save the theme data
    const saveSubscription = this.data$
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.persitor.save(data);
      });

    if (!file.contentLoaded && !file.fetchingContent) {
      file.fetchContent();
    }

    this.addDisposer(() => {
      dataSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }

  save(): void {}
}
