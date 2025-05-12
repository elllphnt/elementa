import {
  ElementRepeatData,
  Evaluable,
  Expression,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { Element } from "../../../_interfaces/component/elements/element.js";
import { Fragment } from "../fragment.js";

export abstract class ElementModel<T extends { type: string; id: string }>
  extends Model<T>
  implements Element
{
  protected _state: RecordState<Partial<T>>;
  protected _fragment: Fragment;
  protected _cssStyleSheet: CssStyleSheet;
  protected _id: string;

  constructor({
    init,
    fragment,
    cssStyleSheet,
  }: {
    init: T;
    fragment: Fragment;
    cssStyleSheet: CssStyleSheet;
  }) {
    super();

    this._id = init.id;
    this._fragment = fragment;
    this._cssStyleSheet = cssStyleSheet;

    this._state = new RecordState({
      init: {
        ...init,
        id: undefined,
        fragment: undefined,
        cssStyleSheet: undefined,
      } as any,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get id(): string {
    return this._id;
  }

  get type(): string {
    return this._state.record.type as string;
  }

  get fragment(): Fragment {
    return this._fragment;
  }

  get cssStyleSheet(): CssStyleSheet {
    return this._cssStyleSheet;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [this._cssStyleSheet];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return this._fragment.allCssStylesheets$;
  }

  get name(): string | undefined {
    return this._state.record.name as string | undefined;
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get tag(): string | undefined {
    return this._state.record.tag as string | undefined;
  }

  get tag$(): Observable<string | undefined> {
    return this._state.entry$("tag");
  }

  get repeat(): ElementRepeatData | undefined {
    return this._state.record.repeat as ElementRepeatData | undefined;
  }

  get repeat$(): Observable<ElementRepeatData | undefined> {
    return this._state.entry$("repeat");
  }

  get condition(): Evaluable<boolean> | undefined {
    return this._state.record.condition as Evaluable<boolean> | undefined;
  }

  get condition$(): Observable<Evaluable<boolean> | undefined> {
    return this._state.entry$("condition");
  }

  get interactions(): Record<string, Expression> | undefined {
    return this._state.record.interactions as
      | Record<string, Expression>
      | undefined;
  }

  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this._state.entry$("interactions");
  }

  get link(): LinkData | undefined {
    return this._state.record.link as LinkData | undefined;
  }

  get link$(): Observable<LinkData | undefined> {
    return this._state.entry$("link");
  }

  get ariaLabel(): ResolvableOrEvaluable<string> | undefined {
    return this._state.record.ariaLabel as
      | ResolvableOrEvaluable<string>
      | undefined;
  }

  get ariaLabel$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._state.entry$("ariaLabel");
  }

  get ariaHidden(): ResolvableOrEvaluable<boolean> | undefined {
    return this._state.record.ariaHidden as
      | ResolvableOrEvaluable<boolean>
      | undefined;
  }

  get ariaHidden$(): Observable<ResolvableOrEvaluable<boolean> | undefined> {
    return this._state.entry$("ariaHidden");
  }

  get ariaRole(): ResolvableOrEvaluable<string> | undefined {
    return this._state.record.ariaRole as
      | ResolvableOrEvaluable<string>
      | undefined;
  }

  get ariaRole$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._state.entry$("ariaRole");
  }

  get tabIndex(): ResolvableOrEvaluable<number> | undefined {
    return this._state.record.tabIndex as
      | ResolvableOrEvaluable<number>
      | undefined;
  }

  get tabIndex$(): Observable<ResolvableOrEvaluable<number> | undefined> {
    return this._state.entry$("tabIndex");
  }

  abstract get data(): T;
  abstract get data$(): Observable<T>;
  abstract restore(data: T): void;
}
