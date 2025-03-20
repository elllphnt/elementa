import {
  combineLatestOrEmpty,
  Datafiable,
  restoreReactiveArray,
  SerializableState,
} from "@repo/utils";
import _ from "lodash";
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  map,
  Observable,
  switchMap,
  take,
  timeout,
} from "rxjs";
import { Activity, ActivityType } from "./activity";
import { Context } from "./context";
import { EditorState, EditorStateData } from "./editor";
import { Shell } from "./shell";

export type WorkspaceData = {
  state: any;
  editors: EditorStateData[];
  activeEditorIndex?: number;
  focusedEditorId?: string;
};

export type WorkspaceLayout = {
  appBar?: boolean;
  statusBar?: boolean;
  activityBar?: boolean;
  activityPanel?: boolean;
  contextPanel?: boolean;
  board?: {
    defaultView?: string;
  };
};
export type WorkspaceViewMap = {
  appBar?: string;
  boardPlaceholder?: string;
};

export abstract class Workspace implements Datafiable<WorkspaceData> {
  static key = 0;
  key = Workspace.key++;

  readonly shell: Shell;
  readonly state = new SerializableState();

  private _root$ = new BehaviorSubject<HTMLElement | undefined>(undefined);
  private _initialized$ = new BehaviorSubject<boolean>(false);

  private _editors$ = new BehaviorSubject<EditorState[]>([]);
  private _focusedEditor$ = new BehaviorSubject<EditorState | undefined>(
    undefined,
  );
  private _activeEditorIndex$ = new BehaviorSubject<number>(0);

  private _activities$ = new BehaviorSubject<Record<string, Activity>>({});

  abstract get layout(): WorkspaceLayout;
  abstract get viewMap(): WorkspaceViewMap;

  get root$() {
    return this._root$;
  }
  get root() {
    return this._root$.value;
  }

  get editors$() {
    return this._editors$;
  }
  get editors() {
    return this._editors$.value;
  }

  get focusedEditor() {
    return this._focusedEditor$.value;
  }
  get focusedEditor$() {
    return this._focusedEditor$.asObservable();
  }

  get activeEditorIndex() {
    return Math.max(
      0,
      Math.min(this.editors.length - 1, this._activeEditorIndex$.value),
    );
  }
  get activeEditorIndex$() {
    return combineLatestOrEmpty([this._activeEditorIndex$, this.editors$]).pipe(
      map(([index, editors]) =>
        Math.max(0, Math.min(editors.length - 1, index)),
      ),
    );
  }
  get activeEditor(): EditorState | undefined {
    return this.editors[this.activeEditorIndex];
  }
  get activeEditor$(): Observable<EditorState | undefined> {
    return this.activeEditorIndex$.pipe(
      switchMap((index) =>
        this.editors$.pipe(map((editors) => editors[index])),
      ),
    );
  }

  get activities$() {
    return this._activities$;
  }
  get activities() {
    return this._activities$.value;
  }

  activity(id: string) {
    return this._activities$.value[id] as Activity | undefined;
  }
  activity$(id: string) {
    return this._activities$.pipe(
      map((activities) => activities[id]),
    ) as Observable<Activity | undefined>;
  }
  private _activityOfType(activities: Activity[], type: ActivityType) {
    return activities
      .filter((a) => a.type === type)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  get primaryActivities$() {
    return this._activities$.pipe(
      map((activities) =>
        this._activityOfType(Object.values(activities), "primary"),
      ),
    );
  }
  get primaryActivities() {
    return this._activityOfType(
      Object.values(this._activities$.value),
      "primary",
    );
  }
  get secondaryActivities$() {
    return this._activities$.pipe(
      map((activities) =>
        this._activityOfType(Object.values(activities), "secondary"),
      ),
    );
  }
  get secondaryActivities() {
    return this._activityOfType(
      Object.values(this._activities$.value),
      "secondary",
    );
  }

  abstract get contexts(): Context[];
  abstract get contexts$(): Observable<Context[]>;

  get initialized$() {
    return this._initialized$;
  }
  get initialized() {
    return this._initialized$.value;
  }

  get data(): WorkspaceData {
    return {
      state: this.state.data,
      editors: this.editors.map((editor) => editor.data),
      activeEditorIndex: this.activeEditorIndex,
      focusedEditorId: this.focusedEditor?.id,
    };
  }
  get data$() {
    return combineLatestOrEmpty([
      this.state.data$,
      this.editors$.pipe(
        switchMap((editors) =>
          combineLatestOrEmpty(editors.map((editor) => editor.data$)),
        ),
      ),
      this.activeEditorIndex$,
      this.focusedEditor$.pipe(map((editor) => editor?.id)),
    ]).pipe(
      map(([state, editors, activeEditorIndex, focusedEditorId]) => ({
        state,
        editors,
        activeEditorIndex,
        focusedEditorId,
      })),
    );
  }

  constructor({ shell }: { shell: Shell }) {
    this.shell = shell;
  }

  setRoot(root: HTMLElement | undefined) {
    this._root$.next(root);
  }

  addEditor(editor: EditorState) {
    const next: EditorState[] = [];
    const toRemove: EditorState[] = [];

    for (const e of this.editors) {
      if (!e.stable) {
        toRemove.push(e);
      } else {
        next.push(e);
      }
    }
    next.push(editor);
    this._editors$.next(next);
    toRemove.forEach((e) => e.dispose());
  }
  removeEditor(editor: EditorState) {
    this._editors$.next(this.editors.filter((e) => e !== editor));
  }
  setFocusedEditor(editor: EditorState | undefined) {
    this._focusedEditor$.next(editor);
  }
  activateEditor(editor: EditorState | undefined) {
    this._activeEditorIndex$.next(editor ? this.editors.indexOf(editor) : -1);
  }

  loadActivities(...activities: Activity[]) {
    const newActivities = { ...this._activities$.value };
    activities.forEach((a) => (newActivities[a.id] = a));
    this._activities$.next(newActivities);
  }
  unloadActivities(...activityIds: string[]) {
    const newActivities = _.omit(this._activities$.value, activityIds);
    this._activities$.next(newActivities);
  }
  unloadAllActivities() {
    this._activities$.next({});
  }
  setActivities(activities: Activity[]) {
    this._activities$.next(_.keyBy(activities, "id"));
  }

  untilInitialized(timeoutMs?: number) {
    return firstValueFrom(
      this.initialized$.pipe(
        filter((loaded) => loaded),
        take(1),
        timeoutMs ? timeout(timeoutMs) : take(1),
      ),
    );
  }

  initialize() {
    this._initialized$.next(true);
  }

  restore(data: WorkspaceData) {
    // Restore state
    this.state.restore(data.state);

    // Restore editors
    restoreReactiveArray({
      datafiables$: this._editors$,
      data: data.editors,
      create: (data) => {
        const state = this.shell.createEditorState(data);
        if (!state) throw new Error("Editor state not created");
        return state;
      },
      restore: (editor, data) => editor.restore(data),
      dispose: (editor) => editor.dispose(),
      identifyData: (data) => data.id,
      identifyDatafiable: (editor) => editor.id,
    });

    // Restore active editor
    this._activeEditorIndex$.next(data.activeEditorIndex ?? 0);

    // Restore focused editor
    this._focusedEditor$.next(
      this.editors.find((editor) => editor.id === data.focusedEditorId),
    );
  }
}
