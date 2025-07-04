import { Lifecycle } from "@elllphnt/elementa-kernel";
import type { File } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import {
  BehaviorSubject,
  debounceTime,
  filter,
  firstValueFrom,
  map,
  timeout,
} from "rxjs";
import type {
  Diagnostic,
  Diagnosticable,
} from "../../_shared/diagnosticable.js";
import { DiagnosticLevel } from "../../_shared/diagnosticable.js";
import { moduleLogger } from "../../loggers.js";

export type ModuleState = {
  value: any;
  evaluationNumber: number;
  dependencies: string[];
  error?: Error;
};

export const nullModuleState: ModuleState = {
  value: undefined,
  evaluationNumber: -1,
  dependencies: [],
};

export class Module extends Lifecycle implements Diagnosticable {
  readonly file: File;
  private readonly _evaluate: (url: string) => Promise<void>;

  private _state$ = new BehaviorSubject<ModuleState>(nullModuleState);
  private _diagnostics$ = new BehaviorSubject<Diagnostic[]>([]);

  // Implement Diagnosticable interface
  get diagnostics(): Diagnostic[] {
    return this._diagnostics$.value;
  }

  get diagnostics$(): Observable<Diagnostic[]> {
    return this._diagnostics$.asObservable();
  }

  get diagnosticLevel(): number {
    if (this.diagnostics.length === 0) return DiagnosticLevel.Info;
    return Math.max(...this.diagnostics.map((d) => d.level));
  }

  get diagnosticLevel$(): Observable<number> {
    return this.diagnostics$.pipe(
      map((diagnostics) => {
        if (diagnostics.length === 0) return DiagnosticLevel.Info;
        return Math.max(...diagnostics.map((d) => d.level));
      })
    );
  }

  get url() {
    return this.file.url;
  }

  value$ = this._state$.asObservable().pipe(map((d) => d.value));
  get value() {
    return this._state$.value.value;
  }

  resolved$ = this._state$
    .asObservable()
    .pipe(map((d) => d.evaluationNumber >= 0));
  get resolved() {
    return this._state$.value.evaluationNumber >= 0;
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
      this._diagnostics$.complete();
    });
  }

  init() {
    const subscription = this.file.content.text$
      .pipe(debounceTime(30))
      .subscribe(() => this._evaluate(this.file.url));

    this.addDisposer(() => {
      subscription.unsubscribe();
    });
  }

  setState(state: ModuleState): void {
    this._state$.next(state);

    // Update diagnostics based on the module state
    const diagnostics: Diagnostic[] = [];
    if (state.error) {
      diagnostics.push({
        level: DiagnosticLevel.Error,
        message: state.error.message,
      });
    }
    this._diagnostics$.next(diagnostics);

    moduleLogger.debug(`Update module state ${this.url}`, {
      url: this.url,
      evaluationNumber: state.evaluationNumber,
      hasValue: !!state.value,
      dependencyCount: state.dependencies.length,
      dependencies: state.dependencies,
      hasError: !!state.error,
      error: state.error?.message,
    });
  }

  async untilResolved(timeoutTime: number = 5000): Promise<void> {
    await firstValueFrom(
      this.resolved$.pipe(filter(Boolean), timeout(timeoutTime))
    );
  }
}
