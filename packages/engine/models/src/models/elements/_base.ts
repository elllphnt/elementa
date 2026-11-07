import type {
  BaseElementData,
  ElementRepeatData,
  Evaluable,
  Expression,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { of, Subject } from "rxjs";
import type { CssStyleSheet } from "~/css/lib/stylesheet.js";
import { StyleClassCssStyleSheet } from "~/css/stylesheets/stylesheet/stylesheet.js";
import { Identifiable } from "../identifiable.js";
import { StyleClass } from "../style/stylesheet/styleclass.js";
import type { ElementEnvironment } from "./_environment.js";

export abstract class BaseElement<
  T extends BaseElementData<string>
> extends Identifiable<T> {
  readonly type: T["type"];
  readonly environment: ElementEnvironment;
  readonly cssStyleSheet: StyleClassCssStyleSheet;

  private _styleClass: StyleClass;
  private _updated$ = new Subject();

  get styleClass(): StyleClass {
    return this._styleClass;
  }

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
    return this.state as RecordState<T>;
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

  get updated$() {
    return this._updated$.asObservable();
  }

  constructor({
    state,
    type,
    environment,
    initialized,
  }: {
    state: RecordState<T>;
    type: T["type"];
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, initialized, project: environment.project });

    this.type = type;
    this.environment = environment;

    if (!initialized) {
      this.state.set("type" as keyof T, type as T[keyof T]);
    }

    this._styleClass = new StyleClass({
      state: state.getRecordState("styleClass" as any),
      project: environment.project,
    });

    this.cssStyleSheet = new StyleClassCssStyleSheet({
      target: `element-${this.id}`,
      styleClass: this._styleClass,
    });

    this.addLifecycle(this._styleClass);
    this.addLifecycle(this.cssStyleSheet);

    this.addInitializer(() => {
      this.addDisposer(() => {
        this._updated$.complete();
      });
    });

    this.addDisposer(() => {
      this._updated$.complete();
    });
  }
}
