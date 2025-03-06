import { BehaviorSubject, Observable, of } from "rxjs";
import { Datafiable, Disposable } from "@repo/utils";
import { Context } from "./context";
import { Shell } from "./shell";

export type EditorStateData = {
  id: string;
  editorId: string;
};
export type EditorAction = {
  name: string;
  icon?: string;
  color?: string;
  action?: () => void;
};
export abstract class EditorState<D extends EditorStateData = EditorStateData>
  extends Disposable
  implements Datafiable<D>
{
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  key = `${EditorState.keySeed}-${EditorState.key++}`;

  readonly id: string;
  readonly editorId: string;
  readonly shell: Shell;

  private _stable$ = new BehaviorSubject<boolean>(false);
  private _actions$ = new BehaviorSubject<EditorAction[]>([]);

  abstract get title$(): Observable<string>;
  abstract get title(): string;

  abstract get contexts$(): Observable<Context[]>;
  abstract get contexts(): Context[];

  abstract get icon$(): Observable<{
    name: string;
    color: string;
  }>;
  abstract get icon(): {
    name: string;
    color: string;
  };

  get editor() {
    return this.shell.editor(this.editorId);
  }
  get editor$() {
    return this.shell.editor$(this.editorId);
  }

  get actions$() {
    return this._actions$.asObservable();
  }
  get actions() {
    return this._actions$.value;
  }

  get _data(): EditorStateData {
    return {
      id: this.id,
      editorId: this.editorId,
    };
  }
  get _data$(): Observable<EditorStateData> {
    return of(this._data);
  }

  abstract get data(): D;
  abstract get data$(): Observable<D>;
  abstract restore(data: D): void;

  get stable() {
    return this._stable$.value;
  }
  get stable$() {
    return this._stable$.asObservable();
  }

  get loading() {
    return false;
  }
  get loading$() {
    return of(false);
  }

  constructor({
    shell,
    id,
    editorId,
  }: {
    shell: Shell;
    id?: string;
    editorId: string;
  }) {
    super();
    this.shell = shell;
    this.id = id ?? Math.random().toString(36).slice(2, 9);
    this.editorId = editorId;

    this.addDisposer(() => {
      this._stable$.complete();
    });
  }

  stabilize() {
    this._stable$.next(true);
  }

  addAction(action: EditorAction) {
    this._actions$.next([...this._actions$.value, action]);
  }
  removeAction(name: string) {
    this._actions$.next(
      this._actions$.value.filter((action) => action.name !== name),
    );
  }
  updateAction(name: string, action: Partial<EditorAction>) {
    this._actions$.next(
      this._actions$.value.map((a) =>
        a.name === name ? { ...a, ...action } : a,
      ),
    );
  }
}

export type Editor = {
  id: string;
  createState: (shell: Shell, id?: string) => EditorState;
  views: Record<string, string>;
};
