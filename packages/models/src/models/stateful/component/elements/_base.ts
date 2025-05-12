import {
  BaseElementData,
  ElementRepeatData,
  Evaluable,
  Expression,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  assert,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { forkJoin, Observable, of } from "rxjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "../../../../css/_.js";
import { Project } from "../../../../infrastructure/_.js";
import { BaseElement } from "../../../_interfaces/component/elements/_base.js";
import { IdentifiableModel } from "../../_shared/identifiable.js";
import { StylesheetModel } from "../../style/stylesheet.js";

export abstract class BaseElementModel<
    T extends BaseElementData<string>,
    K extends keyof T = never
  >
  extends IdentifiableModel<T>
  implements BaseElement<T["type"]>
{
  // readonly properties
  readonly type: T["type"];
  readonly project: Project;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  // private properties
  private _stylesheet: StylesheetModel;
  protected _state: RecordState<Omit<T, "id" | "type" | "stylesheet" | K>>;

  // getters for properties
  get allCssStylesheets(): CssStyleSheet[] {
    return [this.cssStyleSheet];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return of([this.cssStyleSheet]);
  }

  private get _baseElementState() {
    return this._state as RecordState<
      Omit<BaseElementData<T["type"]>, "id" | "type" | "stylesheet">
    >;
  }

  get name(): string | undefined {
    return this._baseElementState.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._baseElementState.entry$("name");
  }

  get tag(): string | undefined {
    return this._baseElementState.entry("tag");
  }

  get tag$(): Observable<string | undefined> {
    return this._baseElementState.entry$("tag");
  }

  get repeat(): ElementRepeatData | undefined {
    return this._baseElementState.entry("repeat") as
      | ElementRepeatData
      | undefined;
  }

  get repeat$(): Observable<ElementRepeatData | undefined> {
    return this._baseElementState.entry$("repeat");
  }

  get condition(): Evaluable<boolean> | undefined {
    return this._baseElementState.entry("condition") as
      | Evaluable<boolean>
      | undefined;
  }

  get condition$(): Observable<Evaluable<boolean> | undefined> {
    return this._baseElementState.entry$("condition");
  }

  get interactions(): Record<string, Expression> | undefined {
    return this._baseElementState.entry("interactions") as
      | Record<string, Expression>
      | undefined;
  }

  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this._baseElementState.entry$("interactions");
  }

  get link(): LinkData | undefined {
    return this._baseElementState.entry("link") as LinkData | undefined;
  }

  get link$(): Observable<LinkData | undefined> {
    return this._baseElementState.entry$("link");
  }

  get ariaLabel(): ResolvableOrEvaluable<string> | undefined {
    return this._baseElementState.entry("ariaLabel") as
      | ResolvableOrEvaluable<string>
      | undefined;
  }

  get ariaLabel$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._baseElementState.entry$("ariaLabel");
  }

  get ariaHidden(): ResolvableOrEvaluable<boolean> | undefined {
    return this._baseElementState.entry("ariaHidden") as
      | ResolvableOrEvaluable<boolean>
      | undefined;
  }

  get ariaHidden$(): Observable<ResolvableOrEvaluable<boolean> | undefined> {
    return this._baseElementState.entry$("ariaHidden");
  }

  get ariaRole(): ResolvableOrEvaluable<string> | undefined {
    return this._baseElementState.entry("ariaRole") as
      | ResolvableOrEvaluable<string>
      | undefined;
  }

  get ariaRole$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._baseElementState.entry$("ariaRole");
  }

  get tabIndex(): ResolvableOrEvaluable<number> | undefined {
    return this._baseElementState.entry("tabIndex") as
      | ResolvableOrEvaluable<number>
      | undefined;
  }

  get tabIndex$(): Observable<ResolvableOrEvaluable<number> | undefined> {
    return this._baseElementState.entry$("tabIndex");
  }

  // data getters
  get _data(): BaseElementData<T["type"]> {
    return {
      ...super._data,
      type: this.type,
      ...this._state.record,
      stylesheet: this._stylesheet.data,
    };
  }
  get _data$(): Observable<BaseElementData<T["type"]>> {
    return combineLatestMerged([
      super._data$,
      this._state.record$,
      forkJoin({
        type: of(this.type),
        stylesheet: this._stylesheet.data$,
      }),
    ]) as Observable<BaseElementData<T["type"]>>;
  }

  abstract get data(): T;
  abstract get data$(): Observable<T>;

  // constructor
  constructor({ init, project }: { init: Omit<T, K>; project: Project }) {
    const { id, type, stylesheet, ...stateData } = init as T;
    super({ id, key: keyManager.next("element") });

    this.type = type;
    this.project = project;

    this._stylesheet = new StylesheetModel({
      init: stylesheet ?? {},
      project,
    });
    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: `element-${this.id}`,
      stylesheet: this._stylesheet,
    });

    this._state = new RecordState({
      init: stateData as Omit<T, "id" | "type" | "stylesheet" | K>,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this.cssStyleSheet.dispose();
    });
  }

  // restore method
  restore(data: T) {
    const { id, type, stylesheet, ...stateData } = data;
    assert(type === this.type, "Element type mismatch");

    super.restore({ id });
    this._state.setRecord(
      stateData as Omit<T, "id" | "type" | "stylesheet" | K>
    );
    this._stylesheet.restore(stylesheet ?? {});
  }
}
