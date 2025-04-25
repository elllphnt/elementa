import { entityTypes, SlotElementData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import _ from "lodash";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Component } from "../../component";
import { Entity } from "../entity";
import { ElementContainer } from "./_common/container";
import { Element } from "./element";

export class SlotElement
  extends Element<SlotElementData>
  implements ElementContainer
{
  private _placeholder$ = new BehaviorSubject<Element[]>([]);

  get placeholder() {
    return this._placeholder$.value;
  }
  get placeholder$() {
    return this._placeholder$.asObservable();
  }

  get allCssStylesheets() {
    return [
      ...super.allCssStylesheets,
      ...this.placeholder.flatMap((c) => c.allCssStylesheets),
    ];
  }
  get allCssStylesheets$() {
    return combineLatestOrEmpty([
      super.allCssStylesheets$,
      this.placeholder$.pipe(
        switchMap((children) =>
          combineLatestOrEmpty(children.map((c) => c.allCssStylesheets$)),
        ),
      ),
    ]).pipe(
      map(([stylesheets, childrenStylesheets]) => [
        ...stylesheets,
        ..._.flatten(childrenStylesheets),
      ]),
    );
  }

  get content() {
    return this.placeholder;
  }
  get content$() {
    return this.placeholder$;
  }

  get data(): SlotElementData {
    return {
      ...super._data,
      placeholder: this.placeholder.map((child) => child.data),
    };
  }
  get data$(): Observable<SlotElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this._placeholder$.pipe(
        switchMap((children) =>
          combineLatestOrEmpty(children.map((child) => child.data$)),
        ),
      ),
    ]).pipe(
      map(([data, placeholder]) => ({
        ...data,
        placeholder,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      type: entityTypes.elements.slot,
      component,
    });

    this.addDisposer(() => {
      this.placeholder.forEach((child) => child.dispose());
      this._placeholder$.next([]);
      this._placeholder$.complete();
    });

    ElementContainer.watchContent(this);
  }

  setContent(elements: Element[]): void {
    this._placeholder$.next(elements);
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
  }
  moveElements(index: number, ...elements: Element[]) {
    ElementContainer.moveElements(this, index, ...elements);
  }

  restore(data: SlotElementData) {
    super.restore(data);

    // children
    Entity.restoreReactiveArray({
      datafiables$: this._placeholder$,
      data: data.placeholder,
      component: this.component,
    });
  }
}
