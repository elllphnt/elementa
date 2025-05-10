import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";

export type EditorStateData = {
  activeFileId?: string;
};

export class EditorState {
  private _data$ = new BehaviorSubject<EditorStateData>({});

  get activeFileId() {
    return this._data$.value.activeFileId;
  }
  get activeFileId$() {
    return this._data$.asObservable().pipe(
      map((data) => data.activeFileId),
      distinctUntilChanged()
    );
  }

  setActiveFileId(fileId: string) {
    this._data$.next({ ...this._data$.value, activeFileId: fileId });
  }
}

export const editorState = new EditorState();
