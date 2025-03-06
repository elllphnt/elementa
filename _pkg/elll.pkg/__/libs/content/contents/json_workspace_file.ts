import { makeElllUrl } from "@elllphnt/utils";
import { WorkspaceFile } from "@repo/backend";
import { Disposable, pairwiseOrEmpty } from "@repo/utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import * as Y from "yjs";
import { IElll } from "~/src/elll/_types";
import Room from "../../room";
import { updateYMap } from "../../y";
import { Content } from "../content";

type JsonContentData = {
  loaded: boolean;
  data: any;
};

export class JsonWorkspaceFileContent extends Disposable implements Content {
  static key = 0;
  key = JsonWorkspaceFileContent.key++;

  fileId: string;
  elll: IElll;

  readonly _content$ = new BehaviorSubject<JsonContentData>({
    loaded: false,
    data: {},
  });
  private _updating = false;

  get url(): string {
    return makeElllUrl(this.fileId);
  }

  get file() {
    return this.elll.backend.instance(this.fileId, true) as WorkspaceFile;
  }

  get sharedType() {
    return this.elll.room?.componentDoc.getMap(this.fileId);
  }
  get sharedType$() {
    return this.elll.room$.pipe(
      map((room) => room?.componentDoc.getMap(this.fileId)),
    );
  }

  get name() {
    return this.file.name;
  }
  get name$() {
    return this.file.name$;
  }

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get data() {
    return this.content.data;
  }
  get data$() {
    return this.content$.pipe(map((content) => content.data));
  }

  get loaded() {
    return this.content.loaded;
  }
  get loaded$() {
    return this.content$.pipe(map((content) => content.loaded));
  }

  get loading() {
    return !this.loaded;
  }
  get loading$() {
    return this.loaded$.pipe(map((loaded) => !loaded));
  }

  constructor({ fileId, elll }: { fileId: string; elll: IElll }) {
    super();
    this.fileId = fileId;
    this.elll = elll;

    const observers = new Map<Y.AbstractType<any>, Function>();

    const sharedTypeSubscription = this.sharedType$
      .pipe(distinctUntilChanged(), pairwiseOrEmpty())
      .subscribe(([prevSharedType, sharedType]) => {
        if (prevSharedType) {
          const observer = observers.get(prevSharedType);
          if (observer) {
            prevSharedType.unobserveDeep(observer as any);
            observers.delete(prevSharedType);
          }
        }

        if (!sharedType) {
          this._content$.next({
            loaded: false,
            data: {},
          });
          return;
        }

        const observer = () => {
          if (this._updating) return;

          const content = sharedType.toJSON();
          this._content$.next(content as any);
        };
        sharedType.observeDeep(observer);
        observers.set(sharedType, observer);
        observer();
      });

    // set reference on room change
    const roomSubscription = this.elll.room$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        if (prev) {
          this.clearRef(prev);
        }
        if (next) {
          this.setRef(next);
        }
      });

    this.addDisposer(() => {
      this._content$.complete();
      sharedTypeSubscription.unsubscribe();
      roomSubscription.unsubscribe();

      const room = this.elll.room;
      if (room) {
        this.clearRef(room);
      }
    });
  }

  setRef(room: Room): void {
    console.log("setRef", this.getId(room.id), this.fileId);
    const refs = room.componentDoc.getMap("refs");
    refs.set(this.getId(room.id), this.fileId);
  }
  clearRef(room: Room): void {
    console.log("clearRef", this.getId(room.id));
    const refs = room.componentDoc.getMap("refs");
    refs.delete(this.getId(room.id));
  }

  getId(roomId: string): string {
    return `${roomId}:json_workspace_file:${this.key}`;
  }

  update(data: any): void {
    if (!this.loaded) {
      return;
    }

    const sharedType = this.sharedType;
    if (!sharedType) {
      return;
    }

    this._updating = true;
    try {
      sharedType.doc?.transact(() => {
        updateYMap(sharedType, {
          ...this._content$.value,
          data,
        });
      });
    } finally {
      this._updating = false;
    }
  }
}
