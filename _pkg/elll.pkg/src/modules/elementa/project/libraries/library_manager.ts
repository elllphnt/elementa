import { IFileDrive } from "@repo/backend";
import { combineLatestOrEmpty } from "@repo/utils";
import _ from "lodash";
import { BehaviorSubject, map } from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { SynchronizedModelFile } from "../file";

export type LibrariestoreData = {
  libraries: string[];
};

export class ElllLibraryManager extends SynchronizedModelFile<LibrariestoreData> {
  private _libraries$ = new BehaviorSubject<string[]>([]);

  get libraries() {
    return this._libraries$.value;
  }
  get libraries$() {
    return this._libraries$.asObservable();
  }

  get sourceData$() {
    return this._modelSourceData$.pipe(
      map(
        (data) =>
          data ?? {
            libraries: [],
          },
      ),
    );
  }
  get data$() {
    return combineLatestOrEmpty([this.libraries$]).pipe(
      map(([libraries]) => {
        return {
          libraries,
        };
      }),
    );
  }

  constructor({ elll, drive }: { elll: IElll; drive: IFileDrive }) {
    super({
      elll,
      drive,
      path: ".elll/libraries",
      model: jsonModelConstructor.name,
    });

    this.watchData();
    this.addDisposer(() => {
      this._libraries$.complete();
    });
  }

  installLibrary(tagId: string) {
    this._libraries$.next(_.uniq([...this._libraries$.value, tagId]));
  }
  removeLibrary(tagId: string) {
    this._libraries$.next(
      this._libraries$.value.filter((library) => library !== tagId),
    );
  }

  restore(data: LibrariestoreData): void {
    this._libraries$.next([...(data.libraries ?? [])]);
  }
}
