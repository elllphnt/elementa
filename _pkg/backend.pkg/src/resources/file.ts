import { combineLatestOrEmpty } from "@repo/utils";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs";
import { Backend } from "../lib/backend";
import { Resource, ResourceData } from "../lib/resource";
import { Store } from "../lib/store";

type FileData = ResourceData & {
  path: string;
  type: string;
};
export function extractNameFromPath(path: string) {
  let parts = path.split("/");
  return parts[parts.length - 1];
}
export function updateNameInPath(path: string, name: string) {
  let parts = path.split("/");
  parts[parts.length - 1] = name;
  return parts.join("/");
}
export function pathIsDescendantOf(
  path: string | undefined,
  ancestor: string | undefined,
) {
  if (path === undefined || ancestor === undefined) {
    return false;
  }
  if (ancestor) {
    return path.startsWith(ancestor + "/");
  } else {
    return true;
  }
}
export function pathIsDirectChildOf(
  path: string | undefined,
  parent: string | undefined,
) {
  if (path === undefined || parent === undefined) {
    return false;
  }

  if (parent) {
    return (
      path.startsWith(parent + "/") &&
      path.slice(parent.length).split("/").filter(Boolean).length === 1
    );
  } else {
    return path.split("/").filter(Boolean).length === 1;
  }
}

export function getDuplicateName(name: string) {
  const duplicatePathPart = name.split(".");
  if (duplicatePathPart.length < 2) {
    return `${name} - copy`;
  } else {
    duplicatePathPart[duplicatePathPart.length - 2] += "-copy";
    return duplicatePathPart.join(".");
  }
}
export function getDuplicatePath(path: string) {
  const parts = path.split("/");
  const name = parts[parts.length - 1];
  const base = parts.slice(0, parts.length - 1);
  const duplicateName = getDuplicateName(name);
  return [...base, duplicateName].filter(Boolean).join("/");
}

export abstract class File<D extends FileData = FileData> extends Resource<D> {
  private _path$ = new BehaviorSubject<string | undefined>(undefined);
  private _type$ = new BehaviorSubject<string | undefined>(undefined);
  private _fetchingEntries$ = new BehaviorSubject<boolean>(false);
  private _updatingData$ = new BehaviorSubject<boolean>(false);
  private _duplicating$ = new BehaviorSubject<boolean>(false);
  private _deleting$ = new BehaviorSubject<boolean>(false);

  abstract get fileStore(): Store<File<D>>;

  abstract get driveId(): string | undefined;
  abstract get driveId$(): Observable<string | undefined>;

  get path() {
    return this._path$.value;
  }
  get path$() {
    return this._path$.asObservable().pipe(distinctUntilChanged());
  }

  get type() {
    return this._type$.value;
  }
  get type$() {
    return this._type$.asObservable();
  }

  get fetchingEntries() {
    return this._fetchingEntries$.value;
  }
  get fetchingEntries$() {
    return this._fetchingEntries$.asObservable();
  }

  get updatingData() {
    return this._updatingData$.value;
  }
  get updatingData$() {
    return this._updatingData$.asObservable();
  }

  get duplicating() {
    return this._duplicating$.value;
  }
  get duplicating$() {
    return this._duplicating$.asObservable();
  }

  get deleting() {
    return this._deleting$.value;
  }
  get deleting$() {
    return this._deleting$.asObservable();
  }

  get name() {
    if (this.path === undefined) {
      return undefined;
    }
    return extractNameFromPath(this.path);
  }
  get name$() {
    return this.path$.pipe(
      map((path) => {
        if (path === undefined) {
          return undefined;
        }
        return extractNameFromPath(path);
      }),
    );
  }

  get isDirectory() {
    return this.type === "directory";
  }
  get isDirectory$() {
    return this.type$.pipe(map((type) => type === "directory"));
  }

  isDescendantOf(entry: File): boolean {
    return pathIsDescendantOf(this.path, entry.path);
  }
  isDescendantOf$(entry: File) {
    return combineLatest([this.path$, entry.path$]).pipe(
      map(([path, entryPath]) => {
        return pathIsDescendantOf(path, entryPath);
      }),
    );
  }
  isAncestorOf(entry: File): boolean {
    return entry.isDescendantOf(this);
  }
  isAncestorOf$(entry: File): Observable<boolean> {
    return entry.isDescendantOf$(this);
  }

  isParentOf(entry: File): boolean {
    return pathIsDirectChildOf(entry.path, this.path);
  }
  isParentOf$(entry: File): Observable<boolean> {
    return combineLatest([this.path$, entry.path$]).pipe(
      map(([path, entryPath]) => {
        return pathIsDirectChildOf(entryPath, path);
      }),
    );
  }

  entries({ autoFetch }: { autoFetch?: boolean } = {}) {
    return this.fileStore.query({
      key: `entries:${this.id}`,
      resolve$: (files$) => {
        return combineLatestOrEmpty([
          this.path$,
          files$.pipe(
            switchMap((files) =>
              combineLatest(
                files
                  .filter((file) => file.driveId === this.driveId)
                  .map((file) =>
                    combineLatest([file.path$]).pipe(
                      map(([path]) => ({
                        path,
                        file,
                      })),
                    ),
                  ),
              ),
            ),
          ),
        ]).pipe(
          map(([path, files]) => {
            return files.filter((file) => pathIsDirectChildOf(file.path, path));
          }),
          map((files) => {
            return files.map(({ file }) => file);
          }),
        );
      },
      resolve: (files) => {
        return files
          .filter((file) => file.driveId === this.driveId)
          .filter((file) => pathIsDirectChildOf(file.path, this.path));
      },
      fetch: async () => {
        return this.fetchEntries();
      },
      autoFetch,
    });
  }

  constructor({
    id,
    backend,
    entity,
  }: {
    id: string;
    backend: Backend;
    entity: string;
  }) {
    super({ id, backend, entity });

    this.addDisposer(() => {
      this._path$.complete();
      this._type$.complete();
    });
  }

  setLocalPath(path: string) {
    // update children paths
    this.entries().data.forEach((entry) => {
      const name = entry.name;
      if (name !== undefined) {
        entry.setLocalPath([path, name].filter(Boolean).join("/"));
      }
    });

    this._path$.next(path);
  }
  setPath(path: string) {
    this.setLocalPath(path);
    this.update({ path });
  }
  setName(name: string) {
    if (this.path === undefined) {
      return;
    }
    this.setPath(updateNameInPath(this.path, name));
  }
  moveTo(file: File) {
    if (this.path === undefined) {
      return;
    }
    this.setPath(
      [...(file.path?.split("/") ?? []), extractNameFromPath(this.path)]
        .filter(Boolean)
        .join("/"),
    );
  }
  protected loadData(data: D): void {
    this._path$.next(data.path);
    this._type$.next(data.type);
  }

  abstract fetchEntryData(): Promise<void>;
  async fetchEntries() {
    if (this.fetchingEntries) {
      return;
    }

    try {
      this._fetchingEntries$.next(true);
      await this.fetchEntryData();
    } finally {
      setTimeout(() => {
        this._fetchingEntries$.next(false);
        // The store instances are debounced by 100ms.
        // This allow the store to update to propagate before setting fetching to false.
      }, 200);
    }
  }

  update(data: { path?: string; type?: string }) {
    if (this.updatingData) {
      return;
    }

    try {
      this._updatingData$.next(true);
      this.updateData(data);
    } finally {
      this._updatingData$.next(false);
    }
  }
  abstract updateData(update: { path?: string; type?: string }): Promise<void>;

  abstract createEntry({
    type,
    name,
  }: {
    type: string;
    name: string;
  }): Promise<File | undefined>;

  abstract deleteData(): Promise<void>;
  async delete() {
    if (this.deleting) {
      return;
    }

    try {
      this._deleting$.next(true);
      await this.deleteData();
    } finally {
      this._deleting$.next(false);
    }
  }

  abstract duplicateData(): Promise<File>;
  async duplicate() {
    if (this.duplicating) {
      return;
    }

    try {
      this._duplicating$.next(true);
      return await this.duplicateData();
    } finally {
      this._duplicating$.next(false);
    }
  }
}
