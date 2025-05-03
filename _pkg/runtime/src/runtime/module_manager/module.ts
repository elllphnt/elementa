import { File } from "@elllphnt/elementa-models";
import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, debounceTime, map } from "rxjs";

export type ModuleState = {
  value: unknown;
  evaluationNumber: number;
  dependencies: string[];
  error?: Error;
};

export const nullModuleState: ModuleState = {
  value: undefined,
  evaluationNumber: -1,
  dependencies: [],
};

export class Module extends Disposable {
  readonly file: File;
  private readonly _evaluate: (url: string) => Promise<void>;

  private _state$ = new BehaviorSubject<ModuleState>(nullModuleState);

  get url() {
    return this.file.url;
  }

  value$ = this._state$.asObservable().pipe(map((d) => d.value));
  get value() {
    return this._state$.value.value;
  }

  resolved$ = this._state$
    .asObservable()
    .pipe(map((d) => d.evaluationNumber >= 0 && d.error === undefined));
  get resolved() {
    return (
      this._state$.value.evaluationNumber >= 0 &&
      this._state$.value.error === undefined
    );
  }

  error$ = this._state$.asObservable().pipe(map((d) => d.error));
  get error() {
    return this._state$.value.error;
  }

  dependencies$ = this._state$.asObservable().pipe(map((s) => s.dependencies));
  get dependencies() {
    return this._state$.value.dependencies;
  }

  evaluationNumber$ = this._state$
    .asObservable()
    .pipe(map((s) => s.evaluationNumber));
  get evaluationNumber() {
    return this._state$.value.evaluationNumber;
  }

  constructor({
    file,
    evaluate,
  }: {
    file: File;
    evaluate: (url: string) => Promise<void>;
  }) {
    super();
    this.file = file;
    this._evaluate = evaluate;

    this.addDisposer(() => {
      this._state$.next(nullModuleState);
      this._state$.complete();
    });
  }

  init() {
    const subscription = this.file.content$
      .pipe(debounceTime(30))
      .subscribe(() => this._evaluate(this.file.url));

    this.addDisposer(() => {
      subscription.unsubscribe();
    });
  }

  setState(state: ModuleState): void {
    this._state$.next(state);
  }

  async getValue() {
    if (this._state$.value.evaluationNumber < 0) {
      await this._evaluate(this.file.url);
    }
    if (this._state$.value.error) {
      throw this._state$.value.error;
    }
    return this._state$.value.value;
  }
}
