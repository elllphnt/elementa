import { KeyFrameSet, KeyframeSetData, KeyframeSetStore } from "@repo/elementa";
import { restoreReactiveMap } from "@repo/elementa/dist/_lib/restore";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Elll } from "../../../elll/elll";
import { mimeTypes } from "../../constants/mime_types";
import { Persistor } from "../../persitor";
import { ElllProject } from "../project";

const keyframesetFilePath = ".elll/keyframesets.json";

export type KeyframeSetStoreData = {
  keyframesets: KeyframeSetData[];
};

export class ElllKeyframeSetStore
  extends Disposable
  implements KeyframeSetStore
{
  readonly project: ElllProject;
  readonly persitor: Persistor<KeyframeSetStoreData>;

  private _keyframeSets$ = new BehaviorSubject<Record<string, KeyFrameSet>>({});

  get elll(): Elll {
    return this.project.elll;
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

    this.persitor = new Persistor<KeyframeSetStoreData>({
      elll: this.elll,
      resolveFile: (elll) =>
        elll.fileAtPath(keyframesetFilePath, {
          type: mimeTypes.json,
        }),
      resolveFile$: (elll) =>
        elll.fileAtPath$(keyframesetFilePath, {
          type: mimeTypes.json,
        }),
    });

    // Restore data
    const restoreSubscription = this.persitor.data$.subscribe((data) =>
      this.restore(data),
    );
    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      this.persitor.save(data);
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();

      this.persitor.dispose();
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
        data.keyframesets.map((keyframesetData) => [
          keyframesetData._id,
          keyframesetData,
        ]),
      ) as Record<string, KeyframeSetData>,
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
