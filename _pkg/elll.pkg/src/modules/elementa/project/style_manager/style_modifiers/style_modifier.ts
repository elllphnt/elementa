import {
  CssSelector,
  StyleModifierDefinitionData,
  StyleModifierType,
} from "@elllphnt/elll-element";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { genId } from "~/src/libs/id";
import { IStyleModifierSheet } from "./_types";

export class StyleModifierDefinition
  extends Disposable
  implements Datafiable<StyleModifierDefinitionData>
{
  readonly id: string;
  readonly sheet: IStyleModifierSheet;

  private _type$ = new BehaviorSubject<StyleModifierType>(
    StyleModifierType.Element,
  );
  private _name$ = new BehaviorSubject<string>("");
  private _selector$ = new BehaviorSubject<CssSelector>([]);
  private _signature$ = new BehaviorSubject<string[]>([]);
  private _predecence$ = new BehaviorSubject<number | undefined>(undefined);

  get type() {
    return this._type$.value;
  }
  get type$() {
    return this._type$.asObservable();
  }

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get selector() {
    return this._selector$.value;
  }
  get selector$() {
    return this._selector$.asObservable();
  }

  get signature() {
    return this._signature$.value;
  }
  get signature$() {
    return this._signature$.asObservable();
  }

  get predecence() {
    return this._predecence$.value;
  }
  get predecence$() {
    return this._predecence$.asObservable();
  }

  get data(): StyleModifierDefinitionData {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      signature: this.signature,
      selector: this.selector,
      predecence: this.predecence,
    };
  }

  get data$() {
    return combineLatest([
      this.type$,
      this.name$,
      this.selector$,
      this.signature$,
      this.predecence$,
    ]).pipe(
      map(([type, name, selector, signature, predecence]) => ({
        id: this.id,
        type,
        name,
        selector,
        signature,
        predecence,
      })),
    );
  }

  constructor({ id, sheet }: { id?: string; sheet: IStyleModifierSheet }) {
    super();
    this.id = id || genId();
    this.sheet = sheet;
  }

  restore(data: StyleModifierDefinitionData): void {
    this._type$.next(data.type);
    this._name$.next(data.name);
    this._selector$.next(data.selector);
    this._signature$.next(data.signature ?? []);
    this._predecence$.next(data.predecence);
  }
}
