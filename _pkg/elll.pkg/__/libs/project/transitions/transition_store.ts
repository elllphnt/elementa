import { Transition, TransitionData, TransitionStore } from "@repo/elementa";
import { restoreReactiveMap } from "@repo/elementa/dist/_lib/restore";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Elll } from "../../../elll/elll";
import { mimeTypes } from "../../constants/mime_types";
import { Persistor } from "../../persitor";
import { ElllProject } from "../project";

const transitionFilePath = ".elll/transitions.json";

export type TransitionStoreData = {
  transitions: TransitionData[];
};

export class ElllTransitionStore extends Disposable implements TransitionStore {
  readonly project: ElllProject;
  readonly persitor: Persistor<TransitionStoreData>;

  private _transitions$ = new BehaviorSubject<Record<string, Transition>>({});

  get elll(): Elll {
    return this.project.elll;
  }

  get transitions(): Transition[] {
    return Object.values(this._transitions$.value);
  }
  get transitions$(): Observable<Transition[]> {
    return this._transitions$
      .asObservable()
      .pipe(map((transitions) => Object.values(transitions)));
  }
  transition(id: string): Transition | undefined {
    return this._transitions$.value[id];
  }
  transition$(id: string): Observable<Transition | undefined> {
    return this._transitions$.pipe(map((transitions) => transitions[id]));
  }

  get data$(): Observable<TransitionStoreData> {
    return combineLatestOrEmpty([
      this._transitions$.pipe(
        switchMap((transitions) =>
          combineLatestOrEmpty(
            Object.values(transitions).map((transition) => transition.data$),
          ),
        ),
      ),
    ]).pipe(
      map(([transitions]) => ({
        transitions,
      })),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    this.persitor = new Persistor<TransitionStoreData>({
      elll: this.elll,
      resolveFile: (elll) =>
        elll.fileAtPath(transitionFilePath, {
          type: mimeTypes.json,
        }),
      resolveFile$: (elll) =>
        elll.fileAtPath$(transitionFilePath, {
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
      this.transitions.forEach((transition) => transition.dispose());

      this._transitions$.next({});
      this._transitions$.complete();
    });
  }

  addTransition(transition: Transition) {
    this._transitions$.next({
      ...this._transitions$.value,
      [transition.id]: transition,
    });
  }

  removeTransition(transition: Transition) {
    const transitions = { ...this._transitions$.value };
    delete transitions[transition.id];
    this._transitions$.next(transitions);
  }

  setTransitions(transitions: Transition[]) {
    this._transitions$.next(
      Object.fromEntries(
        transitions.map((transition) => [transition.id, transition]),
      ),
    );
  }

  restore(data: TransitionStoreData) {
    restoreReactiveMap({
      datafiable$: this._transitions$,
      data: Object.fromEntries(
        data.transitions.map((transitionData) => [
          transitionData._id,
          transitionData,
        ]),
      ) as Record<string, TransitionData>,
      create: (transitionData) =>
        new Transition({
          id: transitionData._id,
          project: this.project,
        }),
      restore: (transition, transitionData) =>
        transition.restore(transitionData),
      dispose: (transition) => transition.dispose(),
    });
  }
}
