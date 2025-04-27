import { Entity } from "@elllphnt/elementa-models";
import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map } from "rxjs";
import { Elementa } from "../elementa";

export enum DiagnosticSeverity {
  Error = 4,
  Warning = 3,
  Info = 2,
  Hint = 1,
}

export interface Diagnostic {
  topic: string;
  severity: DiagnosticSeverity;
  message: string;
  data?: any;
  instance: Instance;
}

export abstract class Instance<E extends Entity = Entity> extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${Instance.keySeed}-${Instance.key++}`;

  readonly id: string;
  readonly entity: E;
  readonly parent: Instance | undefined;
  readonly elementa: Elementa;

  private _flags$ = new BehaviorSubject<Record<string, boolean>>({});
  private _diagnostics$ = new BehaviorSubject<Record<string, Diagnostic[]>>({});

  flag(key: string) {
    return this._flags$.value[key];
  }
  flag$(key: string) {
    return this._flags$.asObservable().pipe(map((flags) => flags[key]));
  }

  get flags() {
    return this._flags$.value;
  }
  get flags$() {
    return this._flags$.asObservable();
  }

  get diagnostics() {
    return Object.values(this._diagnostics$.value).flat();
  }
  get diagnostics$() {
    return this._diagnostics$
      .asObservable()
      .pipe(map((diagnostics) => Object.values(diagnostics).flat()));
  }

  constructor({
    elementa,
    parent,
    entity,
  }: {
    elementa: Elementa;
    parent: Instance | null;
    entity: E;
  }) {
    super();
    this.entity = entity;
    this.elementa = elementa;
    this.parent = parent ?? undefined;
    this.id = this.parent
      ? `${this.parent.id}:${this.entity.id}`
      : this.entity.id;

    this.addDisposer(() => {
      this._flags$.next({});
      this._flags$.complete();
    });
  }

  setFlag(key: string, value: boolean) {
    this._flags$.next({ ...this._flags$.value, [key]: value });
  }

  setDiagnostics(
    topic: string,
    diagnostics: Omit<Diagnostic, "topic" | "instance">[]
  ) {
    this._diagnostics$.next({
      ...this._diagnostics$.value,
      [topic]: diagnostics.map((diagnostic) => ({
        ...diagnostic,
        topic,
        instance: this,
      })),
    });
  }
  clearDiagnostics(key: string) {
    this._diagnostics$.next({
      ...this._diagnostics$.value,
      [key]: [],
    });
  }

  remove() {
    return this.entity.remove();
  }
}
