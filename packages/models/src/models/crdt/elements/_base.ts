import { ensureField, getOrCreateYMap } from "@elllphnt/crdt";
import {
  BaseElementData,
  ElementRepeatData,
  Evaluable,
  Expression,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  BaseElement,
  CssStyleSheet,
  RenderingEnvironment,
  StylesheetCssStyleSheet,
} from "@elllphnt/elementa-core";
import { CrdtRecordState, keyManager } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import * as y from "yjs";
import { CrdtIdentifiable } from "../_shared/identifiable.js";
import { CrdtStylesheet } from "../style/stylesheet/stylesheet.js";

export abstract class CrdtBaseElement<T extends BaseElementData<string>>
  extends CrdtIdentifiable
  implements BaseElement<T["type"]>
{
  readonly type: T["type"];
  readonly environment: RenderingEnvironment;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  private _stylesheet: CrdtStylesheet;
  protected _state: CrdtRecordState<Omit<T, "id" | "type" | "stylesheet">>;

  get allCssStylesheets(): CssStyleSheet[] {
    return [this.cssStyleSheet];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return of([this.cssStyleSheet]);
  }

  get slotIds(): string[] {
    return [];
  }

  get slotIds$(): Observable<string[]> {
    return of([]);
  }

  private get _baseState() {
    return this._state as CrdtRecordState<
      Omit<BaseElementData<T["type"]>, "id" | "type" | "stylesheet">
    >;
  }

  get name(): string | undefined {
    return this._baseState.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._baseState.entry$("name");
  }

  get tag(): string | undefined {
    return this._baseState.entry("tag");
  }

  get tag$(): Observable<string | undefined> {
    return this._baseState.entry$("tag");
  }

  get repeat(): ElementRepeatData | undefined {
    return this._baseState.entry("repeat");
  }

  get repeat$(): Observable<ElementRepeatData | undefined> {
    return this._baseState.entry$("repeat");
  }

  get condition(): Evaluable<boolean> | undefined {
    return this._baseState.entry("condition");
  }

  get condition$(): Observable<Evaluable<boolean> | undefined> {
    return this._baseState.entry$("condition");
  }

  get interactions(): Record<string, Expression> | undefined {
    return this._baseState.entry("interactions");
  }

  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this._baseState.entry$("interactions");
  }

  get link(): LinkData | undefined {
    return this._baseState.entry("link");
  }

  get link$(): Observable<LinkData | undefined> {
    return this._baseState.entry$("link");
  }

  get ariaLabel(): ResolvableOrEvaluable<string> | undefined {
    return this._baseState.entry("ariaLabel");
  }

  get ariaLabel$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._baseState.entry$("ariaLabel");
  }

  get ariaHidden(): ResolvableOrEvaluable<boolean> | undefined {
    return this._baseState.entry("ariaHidden");
  }

  get ariaHidden$(): Observable<ResolvableOrEvaluable<boolean> | undefined> {
    return this._baseState.entry$("ariaHidden");
  }

  get ariaRole(): ResolvableOrEvaluable<string> | undefined {
    return this._baseState.entry("ariaRole");
  }

  get ariaRole$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._baseState.entry$("ariaRole");
  }

  get tabIndex(): ResolvableOrEvaluable<number> | undefined {
    return this._baseState.entry("tabIndex");
  }

  get tabIndex$(): Observable<ResolvableOrEvaluable<number> | undefined> {
    return this._baseState.entry$("tabIndex");
  }

  constructor({
    crdt,
    type,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    type: T["type"];
    environment: RenderingEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, key: keyManager.next("element"), initialized });

    if (!initialized) {
      ensureField(crdt, "type", () => type);
    }

    this.environment = environment;

    if (!initialized) {
      ensureField(crdt, "type", () => type);
      ensureField(crdt, "stylesheet", () => new y.Map());
    }

    const stylesheetMap = getOrCreateYMap(crdt, "stylesheet");
    this._stylesheet = new CrdtStylesheet({
      crdt: stylesheetMap,
      project: environment.project,
      initialized,
    });

    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: `element-${this.id}`,
      stylesheet: this._stylesheet,
    });

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
      this._stylesheet.dispose();
      this.cssStyleSheet.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new (this.constructor as any)({
      crdt,
      type: this.type,
      environment: this.environment,
      initialized: true,
    });
  }
}
