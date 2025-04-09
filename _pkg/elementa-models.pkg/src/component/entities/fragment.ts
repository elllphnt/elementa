import {
  entityTypes,
  FragmentData,
  FragmentParamData,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { Datafiable, restoreReactiveArray } from "~/src/_lib/restore";
import { CssStyleSheet } from "~/src/css/_";
import { Component } from "../component";
import { FrameWidget } from "./_";
import { fragmentVariants } from "./_libs/fragment";
import { Element } from "./elements/_";
import { ElementContainer } from "./elements/_common/container";
import { Entity } from "./entity";

export class FragmentParam
  extends Disposable
  implements Datafiable<FragmentParamData>
{
  key: string;

  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _tsType$ = new BehaviorSubject<string | undefined>(undefined);
  private _required$ = new BehaviorSubject<boolean | undefined>(undefined);

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get tsType() {
    return this._tsType$.value;
  }
  get tsType$() {
    return this._tsType$.asObservable();
  }

  get required() {
    return this._required$.value;
  }
  get required$() {
    return this._required$.asObservable();
  }

  get data(): FragmentParamData {
    return {
      key: this.key,
      name: this.name,
      tsType: this.tsType,
      required: this.required,
    };
  }
  get data$(): Observable<FragmentParamData> {
    return combineLatestOrEmpty([
      this.name$,
      this._tsType$,
      this._required$,
    ]).pipe(
      map(([name, tsType, required]) => ({
        key: this.key,
        name,
        tsType,
        required,
      })),
    );
  }

  constructor({ key }: { key?: string }) {
    super();
    this.key = key ?? Math.random().toString(36).substring(7);

    this.addDisposer(() => {
      this._tsType$.complete();
      this._required$.complete();
    });
  }

  setName(name: string | undefined) {
    this._name$.next(name);
  }
  setSchema(tsType: string | undefined) {
    this._tsType$.next(tsType);
  }
  setRequired(required: boolean) {
    this._required$.next(required);
  }

  restore(data: FragmentParamData) {
    if (data.key && this.key !== data.key) {
      throw new Error("Key mismatch");
    }

    this._name$.next(data.name);
    this._required$.next(data.required);
    this._tsType$.next(data.tsType);
  }
}

export class Fragment extends Entity<FragmentData> implements ElementContainer {
  readonly variant: string;

  private _content$ = new BehaviorSubject<Element[]>([]);
  private _params$ = new BehaviorSubject<FragmentParam[]>([]);

  get params() {
    return this._params$.value;
  }
  get params$() {
    return this._params$.asObservable();
  }

  get allCssStylesheets(): CssStyleSheet[] {
    const stylesheets = [...this.content.flatMap((c) => c.allCssStylesheets)];
    return stylesheets;
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestOrEmpty([
      this.content$.pipe(
        switchMap((content) =>
          combineLatestOrEmpty(content.map((c) => c.allCssStylesheets$)),
        ),
      ),
      of([]),
    ]).pipe(map(([contentStylesheets]) => [...contentStylesheets.flat()]));
  }

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get data(): FragmentData {
    return {
      ...super._data,
      content: this.content.map((c) => c.data),
      params: this.params.map((p) => p.data),
    };
  }
  get data$(): Observable<FragmentData> {
    return combineLatestOrEmpty([
      super._data$,
      this.content$.pipe(
        switchMap((children) =>
          combineLatestOrEmpty(children.map((c) => c.data$)),
        ),
      ),
      this._params$.pipe(
        switchMap((params) => combineLatestOrEmpty(params.map((p) => p.data$))),
      ),
    ]).pipe(
      map(([data, content, params]) => ({
        ...data,
        content,
        params,
      })),
    );
  }

  constructor({
    id,
    component,
    variant,
  }: {
    id?: string;
    variant?: string;
    component: Component;
  }) {
    super({ id, component, type: entityTypes.fragment });

    this.variant = variant || fragmentVariants.fragment;

    this.addDisposer(() => {
      this.content.forEach((c) => c.dispose());
      this._content$.next([]);
      this._content$.complete();
    });

    ElementContainer.watchContent(this);
  }

  setContent(content: Element[]) {
    this._content$.next(content);
  }

  prependElements(...elements: Element[]) {
    ElementContainer.prependElements(this, ...elements);
  }
  appendElements(...elements: Element[]) {
    ElementContainer.appendElements(this, ...elements);
  }
  insertElements(index: number, ...elements: Element[]) {
    ElementContainer.insertElements(this, index, ...elements);
  }
  removeElements(...elements: Element[]) {
    ElementContainer.removeElements(this, ...elements);

    if (this.variant === fragmentVariants.fragment) {
      // if empty remove self and all depending frames
      this.component.widgets.forEach((widget) => {
        if (
          widget.type === entityTypes.widgets.frame &&
          (widget as FrameWidget).fragmentId === this.id
        ) {
          widget.remove();
        }
      });
      if (!this.content.length) {
        this.remove();
      }
    }
  }
  moveElements(index: number, ...elements: Element[]) {
    ElementContainer.moveElements(this, index, ...elements);
  }

  remove() {
    this.component.removeFragment(this);
  }

  addParam(param: FragmentParam) {
    this._params$.next([...this.params, param]);
  }
  removeParam(param: FragmentParam) {
    this._params$.next(this.params.filter((p) => p !== param));
  }

  restore(data: FragmentData) {
    Entity.restoreReactiveArray({
      datafiables$: this._content$,
      data: data.content,
      component: this.component,
    });

    restoreReactiveArray({
      data: data.params,
      datafiables$: this._params$,
      create: (data) => new FragmentParam({ key: data.key }),
      restore: (param, data) => param.restore(data),
      dispose: (param) => param.dispose(),
      identifyData: (data) => data.key,
      identifyDatafiable: (param) => param.key,
    });
  }
}
