import { StyleVariableData } from "@elllphnt/elll-element";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { genId } from "~/src/libs/id";
import { IStyleVariableSheet } from "./_types";

export class StyleVariable
  extends Disposable
  implements Datafiable<StyleVariableData>
{
  readonly id: string;
  readonly setId: string;
  readonly sheet: IStyleVariableSheet;

  private _name$ = new BehaviorSubject<string>("");
  private _values$ = new BehaviorSubject<Record<string, any>>({});

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get values() {
    return this._values$.value;
  }
  get values$() {
    return this._values$.asObservable();
  }

  get data(): StyleVariableData {
    return {
      id: this.id,
      setId: this.setId,
      name: this.name,
      values: this.values,
    };
  }
  get data$() {
    return combineLatest([this.name$, this.values$]).pipe(
      map(([name, value]) => ({
        id: this.id,
        setId: this.setId,
        name,
        value,
      })),
    );
  }

  constructor({
    id,
    setId,
    sheet,
  }: {
    id?: string;
    setId: string;
    sheet: IStyleVariableSheet;
  }) {
    super();
    this.id = id || genId();
    this.setId = setId;
    this.sheet = sheet;
  }

  restore(data: StyleVariableData): void {
    this._name$.next(data.name || "");
    this._values$.next(data.values || {});
  }
}
