import { Transition, TransitionStore } from "@repo/elementa";
import { restoreReactiveMap } from "@repo/elementa/dist/_lib/restore";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { mimeTypes } from "~/src/libs/mimetypes";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";

const transitionFilePath = ".elll/transitions";

export class ElllTransitionStore extends Disposable implements TransitionStore {
  readonly project: ElllProject;

  private _transitions$ = new BehaviorSubject<Record<string, Transition>>({});

  get elll(): IElll {
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

  get data$(): Observable<any> {
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

  get file() {
    return elllFileAtPath(this.elll, transitionFilePath, {
      type: mimeTypes.json,
    });
  }
  get file$() {
    return elllFileAtPath$(this.elll, transitionFilePath, {
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

  restore(data: any) {
    restoreReactiveMap({
      datafiable$: this._transitions$,
      data: Object.fromEntries(
        data.transitions?.map((transitionData: any) => [
          transitionData._id,
          transitionData,
        ]) ?? [],
      ) as Record<string, any>,
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
