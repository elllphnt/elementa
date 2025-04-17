import { makeElllUrl } from "@elllphnt/utils";
import { WorkspaceFile } from "@repo/backend";
import { pairwiseOrEmpty } from "@repo/utils";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import * as Y from "yjs";
import { updateYMap } from "~/src/libs/y";
import { IElll } from "~/src/types/elll";
import { Content } from "../modules/elll/content/content";
import { Room } from "../modules/elll/room/room";

type JsonContentData = {
  data?: any;
};

export class JsonWorkspaceFileContent extends Content {
  static key = 0;
  key = JsonWorkspaceFileContent.key++;

  fileId: string;
  elll: IElll;

  private _content$ = new BehaviorSubject<JsonContentData>({});

  get url(): string {
    return makeElllUrl(this.fileId);
  }

  get file() {
    return this.elll.backend.instance(this.fileId, true) as WorkspaceFile;
  }

  get sharedType() {
    return this.elll.room?.fileDoc?.getMap(this.contentKey);
  }
  get sharedType$() {
    return this.elll.room$.pipe(
      switchMap(
        (room) =>
          room?.fileDoc$.pipe(
            map((fileDoc) => fileDoc?.getMap(this.contentKey)),
          ) ?? of(undefined),
      ),
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
    return this.content.data ?? {};
  }
  get data$() {
    return this.content$.pipe(map((content) => content.data ?? {}));
  }

  get loaded() {
    return !!this.content.data;
  }
  get loaded$() {
    return this.content$.pipe(map((content) => !!content.data));
  }

  get loading() {
    return !this.loaded;
  }
  get loading$() {
    return this.loaded$.pipe(map((loaded) => !loaded));
  }

  get contentKey() {
    return `${this.fileId}@json`;
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
          this._content$.next({});
          return;
        }

        const observer = () => {
          console.log("observer", sharedType.toJSON());
          const content = sharedType.toJSON();
          this._content$.next(content);
        };
        sharedType.observeDeep(observer);
        observers.set(sharedType, observer);
        observer();
      });

    // set reference on room change
    const roomSubscription = this.elll.room$
      .pipe(
        switchMap((room) =>
          room
            ? room.fileDoc$.pipe(map((doc) => [room, doc] as const))
            : of([undefined, undefined] as const),
        ),
      )
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        if (prev?.[0] && prev?.[1]) {
          this.clearRef(prev[0], prev[1]);
        }
        if (next?.[0] && next[1]) {
          this.setRef(next[0], next[1]);
        }
      });

    this.addDisposer(() => {
      this._content$.complete();
      sharedTypeSubscription.unsubscribe();
      roomSubscription.unsubscribe();

      const room = this.elll.room;
      if (room && room.fileDoc) {
        this.clearRef(room, room.fileDoc);
      }
    });
  }

  setRef(room: Room, doc: Y.Doc): void {
    console.log("setRef", this.getId(room.id), this.contentKey);
    const refs = doc.getMap("refs");
    refs.set(this.getId(room.id), this.contentKey);
  }
  clearRef(room: Room, doc: Y.Doc): void {
    console.log("clearRef", this.getId(room.id));
    const refs = doc.getMap("refs");
    refs.delete(this.getId(room.id));
  }

  getId(roomId: string): string {
    return `${roomId}:json_workspace_file:${this.key}`;
  }

  update(data: any): void {
    if (!this.loaded) {
      console.warn("Trying to update unloaded content.", this);
      return;
    }

    const sharedType = this.sharedType;
    if (!sharedType) {
      console.warn("Trying to update unloaded shared type." + this);
      return;
    }
    const doc = sharedType.doc;
    if (!doc) {
      console.error("Shared type has no doc.", sharedType);
      return;
    }

    doc.transact(() => {
      updateYMap(sharedType, {
        ...this.content,
        data,
      });
      console.log("updateYMap", data, sharedType.toJSON());
    });
  }
  setName(name: string): void {
    this.file.setName(name);
  }
  delete(): Promise<void> {
    return this.file.delete();
  }
}
