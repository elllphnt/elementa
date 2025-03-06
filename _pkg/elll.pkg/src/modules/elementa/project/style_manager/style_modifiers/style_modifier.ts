import {
  CssSelector,
  StyleModifierData,
  StyleModifierType,
} from "@elllphnt/elll-element";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { genId } from "~/src/libs/id";
import { IStyleModifierSheet } from "./_types";

export class StyleModifier
  extends Disposable
  implements Datafiable<StyleModifierData>
{
  readonly id: string;
  readonly sheet: IStyleModifierSheet;

  private _type$ = new BehaviorSubject<StyleModifierType>(
    StyleModifierType.Static,
  );
  private _class$ = new BehaviorSubject<string>("");
  private _selector$ = new BehaviorSubject<CssSelector>([]);
  private _mode$ = new BehaviorSubject<boolean>(false);

  get type() {
    return this._type$.value;
  }
  get type$() {
    return this._type$.asObservable();
  }

  get class() {
    return this._class$.value;
  }
  get class$() {
    return this._class$.asObservable();
  }

  get selector() {
    return this._selector$.value;
  }
  get selector$() {
    return this._selector$.asObservable();
  }

  get mode() {
    return this._mode$.value;
  }
  get mode$() {
    return this._mode$.asObservable();
  }

  get data(): StyleModifierData {
    return {
      id: this.id,
      type: this.type,
      class: this.class,
      selector: this.selector,
      mode: this.mode,
    };
  }

  get data$() {
    return combineLatest([
      this.type$,
      this.class$,
      this.selector$,
      this.mode$,
    ]).pipe(
      map(([type, class_, selector, mode]) => ({
        id: this.id,
        type,
        class: class_,
        selector,
        mode,
      })),
    );
  }

  constructor({ id, sheet }: { id?: string; sheet: IStyleModifierSheet }) {
    super();
    this.id = id || genId();
    this.sheet = sheet;
  }

  restore(data: StyleModifierData): void {
    this._type$.next(data.type);
    this._class$.next(data.class);
    this._selector$.next(data.selector);
    this._mode$.next(data.mode ?? false);
  }
}
