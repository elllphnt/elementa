import { makeElllUrl } from "@elllphnt/utils";
import { CommitFile } from "@repo/backend";
import { BehaviorSubject, map } from "rxjs";
import { IElll } from "~/src/types/elll";
import { Content } from "../modules/elll/content/content";

export class JsonCommitFileContent extends Content {
  static key = 0;
  key = JsonCommitFileContent.key++;

  file: CommitFile;
  elll: IElll;

  private _data$ = new BehaviorSubject<any>(undefined);

  get url(): string {
    return makeElllUrl(this.file.id);
  }

  get name() {
    return this.file.name;
  }
  get name$() {
    return this.file.name$;
  }

  get data() {
    return this._data$.value;
  }
  get data$() {
    return this._data$.asObservable();
  }

  get loaded() {
    return this.data !== undefined;
  }
  get loaded$() {
    return this.data$.pipe(map((content) => content !== undefined));
  }

  get loading() {
    return !this.loaded;
  }
  get loading$() {
    return this.loaded$.pipe(map((loaded) => !loaded));
  }

  constructor({ fileId, elll }: { fileId: string; elll: IElll }) {
    super();
    this.elll = elll;
    this.file = elll.backend.instance(fileId, true) as CommitFile;

    // auto load the content
    if (this.file.content === undefined && !this.file.fetchingContent) {
      this.file.fetchContent();
    }

    const dataSubscription = this.file.content$.subscribe((data) => {
      if (data !== undefined) {
        this._data$.next(JSON.parse(data || "{}"));
      } else {
        this._data$.next(undefined);
      }
    });

    this.addDisposer(() => {
      dataSubscription.unsubscribe();
      this._data$.complete();
    });
  }

  update(data: any): void {
    console.warn("Cannot update text commit file content");
  }
}
