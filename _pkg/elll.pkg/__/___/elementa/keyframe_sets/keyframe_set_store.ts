import { KeyFrameSet, KeyframeSetStore } from "@repo/elementa";
import { restoreReactiveMap } from "@repo/elementa/dist/_lib/restore";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { mimeTypes } from "~/src/libs/mimetypes";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";

const keyframesetFilePath = ".elll/keyframesets";

export type KeyframeSetStoreData = {
  keyframesets?: any[];
};

export class ElllKeyframeSetStore
  extends Disposable
  implements KeyframeSetStore
{
  readonly project: ElllProject;

  private _keyframeSets$ = new BehaviorSubject<Record<string, KeyFrameSet>>({});

  get elll(): IElll {
    return this.project.elll;
  }

  get file() {
    return elllFileAtPath(this.elll, keyframesetFilePath, {
      type: mimeTypes.json,
    });
  }
  get file$() {
    return elllFileAtPath$(this.elll, keyframesetFilePath, {
      type: mimeTypes.json,
    });
  }

  get model() {
    return this.file
      ? this.elll.modelManager.getModel(
          jsonModelConstructor.name,
          this.file.url,
        )
      : undefined;
  }
  get model$() {
    return this.file$.pipe(
      map((file) =>
        file
          ? this.elll.modelManager.getModel(jsonModelConstructor.name, file.url)
          : undefined,
      ),
    );
  }

  get contentData$() {
    return this.model$.pipe(
      switchMap((model) => (model ? model.content.data$ : of({}))),
    );
  }
  get contentData() {
    return this.model?.content.data ?? {};
  }

  get keyframeSets(): KeyFrameSet[] {
    return Object.values(this._keyframeSets$.value);
  }
  get keyframeSets$(): Observable<KeyFrameSet[]> {
    return this._keyframeSets$
      .asObservable()
      .pipe(map((keyframesets) => Object.values(keyframesets)));
  }
  keyframeSet(id: string): KeyFrameSet | undefined {
    return this._keyframeSets$.value[id];
  }
  keyframeSet$(id: string): Observable<KeyFrameSet | undefined> {
    return this._keyframeSets$.pipe(map((keyframesets) => keyframesets[id]));
  }

  get data$(): Observable<KeyframeSetStoreData> {
    return combineLatestOrEmpty([
      this._keyframeSets$.pipe(
        switchMap((keyframesets) =>
          combineLatestOrEmpty(
            Object.values(keyframesets).map((keyframeset) => keyframeset.data$),
          ),
        ),
      ),
    ]).pipe(
      map(([keyframesets]) => ({
        keyframesets,
      })),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    let syncing = false;
    // Restore data
    const restoreSubscription = this.contentData$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.restore(data);
      } finally {
        syncing = false;
      }
    });
    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.model?.content.update(data);
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();

      this.keyframeSets.forEach((keyframeset) => keyframeset.dispose());

      this._keyframeSets$.next({});
      this._keyframeSets$.complete();
    });
  }

  addKeyframeSet(keyframeset: KeyFrameSet) {
    this._keyframeSets$.next({
      ...this._keyframeSets$.value,
      [keyframeset.id]: keyframeset,
    });
  }

  removeKeyframeSet(keyframeset: KeyFrameSet) {
    const keyframesets = { ...this._keyframeSets$.value };
    delete keyframesets[keyframeset.id];
    this._keyframeSets$.next(keyframesets);
  }

  setKeyframeSets(keyframesets: KeyFrameSet[]) {
    this._keyframeSets$.next(
      Object.fromEntries(
        keyframesets.map((keyframeset) => [keyframeset.id, keyframeset]),
      ),
    );
  }

  restore(data: KeyframeSetStoreData) {
    restoreReactiveMap({
      datafiable$: this._keyframeSets$,
      data: Object.fromEntries(
        data.keyframesets?.map((keyframesetData) => [
          keyframesetData._id,
          keyframesetData,
        ]) ?? [],
      ) as Record<string, any>,
      create: (keyframesetData) =>
        new KeyFrameSet({
          project: this.project,
          id: keyframesetData._id,
        }),
      restore: (keyframeset, keyframesetData) =>
        keyframeset.restore(keyframesetData),
      dispose: (keyframeset) => keyframeset.dispose(),
    });
  }
}
