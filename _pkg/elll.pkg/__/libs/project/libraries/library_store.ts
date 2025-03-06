import { Disposable, combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, debounceTime, map } from "rxjs";
import { Persistor } from "../../persitor";
import { ElllProject } from "../project";

const libraryStoreFilePath = ".elll/libraries.json";

export type LibraryDependencyData = {
  libraryId: string;
  version: string;
};
export function makeLibraryDependencySpecifier({
  libraryId,
  version,
}: LibraryDependencyData) {
  return `${libraryId}@${version}`;
}
export function parseLibraryDependencySpecifier(
  specifier: string,
): LibraryDependencyData {
  const [libraryId, version] = specifier.split("@");
  return { libraryId, version };
}

export type LibraryStoreData = {
  libraries?: string[];
};

export class LibraryStore extends Disposable {
  readonly project: ElllProject;
  readonly persistor: Persistor<LibraryStoreData>;

  private _libraries$ = new BehaviorSubject<LibraryDependencyData[]>([]);

  get libraries() {
    return this._libraries$.value;
  }
  get libraries$() {
    return this._libraries$.asObservable();
  }

  get data(): LibraryStoreData {
    return {
      libraries: this._libraries$.value.map(makeLibraryDependencySpecifier),
    };
  }
  get data$() {
    return combineLatestOrEmpty([
      this._libraries$.pipe(
        map((libraries) => libraries.map(makeLibraryDependencySpecifier)),
      ),
    ]).pipe(
      map(([libraries]) => {
        return {
          libraries,
        };
      }),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    this.persistor = new Persistor<LibraryStoreData>({
      elll: project.elll,
      resolveFile: (elll) => {
        return elll.fileAtPath(libraryStoreFilePath);
      },
      resolveFile$: (elll) => {
        return elll.fileAtPath$(libraryStoreFilePath);
      },
    });

    const loadSubscription = this.persistor.data$.subscribe((data) => {
      this.restore(data);
    });
    const saveSubscription = this.data$
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.persistor.save(data);
      });

    this.addDisposer(() => {
      loadSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }

  installLibrary({
    libraryId,
    version,
  }: {
    libraryId: string;
    version: string;
  }) {
    const newLibraries = [...this._libraries$.value];
    const existingIndex = newLibraries.findIndex(
      (library) => library.libraryId === libraryId,
    );

    if (existingIndex === -1) {
      newLibraries.push({ libraryId, version });
    } else {
      newLibraries[existingIndex] = { libraryId, version };
    }

    this._libraries$.next(newLibraries);
  }
  removeLibrary({ libraryId }: { libraryId: string }) {
    this._libraries$.next(
      this._libraries$.value.filter(
        (library) => library.libraryId !== libraryId,
      ),
    );
  }

  restore(data: LibraryStoreData): void {
    this._libraries$.next(
      (data.libraries ?? []).map(parseLibraryDependencySpecifier),
    );
  }
}
