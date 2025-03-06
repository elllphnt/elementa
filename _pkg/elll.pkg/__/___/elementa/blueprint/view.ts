import { init } from "@paralleldrive/cuid2";
import { combineLatestOrEmpty, Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { ViewData } from "./_types";

export class View extends Disposable implements Datafiable<ViewData> {
  static generateId = init({
    length: 7,
  });

  readonly id: string;
  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _type$ = new BehaviorSubject<string | undefined>(undefined);
  private _description$ = new BehaviorSubject<string | undefined>(undefined);
  private _componentIds$ = new BehaviorSubject<string[]>([]);

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get type() {
    return this._type$.value;
  }
  get type$() {
    return this._type$.asObservable();
  }

  get description$() {
    return this._description$;
  }
  get description() {
    return this._description$.value;
  }

  get componentIds$() {
    return this._componentIds$.asObservable();
  }
  get componentIds() {
    return this._componentIds$.value;
  }

  get data(): ViewData {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      componentIds: this.componentIds,
    };
  }
  get data$() {
    return combineLatestOrEmpty([
      this.name$,
      this.type$,
      this.description$,
      this.componentIds$,
    ]).pipe(
      map(([name, type, description, componentIds]) => ({
        id: this.id,
        name,
        type,
        description,
        componentIds,
      })),
    );
  }

  constructor({ id }: { id?: string } = {}) {
    super();
    this.id = id ?? View.generateId();
  }

  setName(name: string): void {
    this._name$.next(name);
  }

  setType(type: string): void {
    this._type$.next(type);
  }

  setDescription(description: string): void {
    this._description$.next(description);
  }

  setComponentIds(componentIds: string[]): void {
    this._componentIds$.next(componentIds);
  }

  restore(data: ViewData): void {
    this._name$.next(data.name);
    this._description$.next(data.description);
    this._type$.next(data.type);
    this._componentIds$.next(data.componentIds ?? []);
  }
}
