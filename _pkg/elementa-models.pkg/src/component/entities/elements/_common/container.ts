import {
  ContainerElementData,
  ElementContainerData,
  ElementData,
  Expression,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import _ from "lodash";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Component, Entity } from "~/src/component/_";
import { Element } from "../element";

export abstract class ElementContainer extends Disposable {
  abstract get content(): Element[];
  abstract get content$(): Observable<Element[]>;

  abstract setContent(elements: Element[]): void;

  abstract prependElements(...elements: Element[]): void;
  abstract appendElements(...elements: Element[]): void;
  abstract insertElements(index: number, ...elements: Element[]): void;
  abstract removeElements(...elements: Element[]): void;
  abstract moveElements(index: number, ...elements: Element[]): void;

  static prependElements(
    container: ElementContainer,
    ...elements: Element[]
  ): void {
    container.setContent(_.uniq([...elements, ...container.content]));
  }
  static appendElements(
    container: ElementContainer,
    ...elements: Element[]
  ): void {
    container.setContent(_.uniq([...container.content, ...elements]));
  }
  static insertElements(
    container: ElementContainer,
    index: number,
    ...elements: Element[]
  ): void {
    const children = container.content;
    const safeIndex = _.clamp(index, 0, children.length);
    const others = children.filter((c) => !elements.includes(c));
    const before = others.slice(0, safeIndex);
    const after = others.slice(safeIndex);
    const newChildren = _.uniq([...before, ...elements, ...after]);
    container.setContent(newChildren);
  }
  static removeElements(
    container: ElementContainer,
    ...elements: Element[]
  ): void {
    container.setContent(
      container.content.filter((c) => !elements.includes(c)),
    );
  }
  static moveElements(
    container: ElementContainer,
    index: number,
    ...elements: Element[]
  ): void {
    const children = container.content;
    const safeIndex = _.clamp(index, 0, children.length);

    const moving = children.filter((c) => elements.includes(c));
    const others = children.filter((c) => !elements.includes(c));

    const before = others.slice(0, safeIndex);
    const after = others.slice(safeIndex);

    container.setContent(_.uniq([...before, ...moving, ...after]));
  }

  static watchContent(container: ElementContainer): void {
    const subscription = container.content$.subscribe((elements) => {
      elements.forEach((element) => {
        if (element.container !== container) {
          element.setContainer(container);
        }
      });
    });

    container.addDisposer(() => {
      subscription.unsubscribe();
    });
  }
}

export abstract class ElementElementContainer<
    D extends ElementData & ElementContainerData,
  >
  extends Element<D>
  implements ElementContainer
{
  private _content$ = new BehaviorSubject<Element[]>([]);
  private _contentExpression$ = new BehaviorSubject<Expression | undefined>(
    undefined,
  );

  get allCssStylesheets() {
    return [
      ...super.allCssStylesheets,
      ...this.content.flatMap((c) => c.allCssStylesheets),
    ];
  }
  get allCssStylesheets$() {
    return combineLatestOrEmpty([
      super.allCssStylesheets$,
      this.content$.pipe(
        switchMap((content) =>
          combineLatestOrEmpty(content.map((c) => c.allCssStylesheets$)),
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
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get contentExpression() {
    return this._contentExpression$.value;
  }
  get contentExpression$() {
    return this._contentExpression$.asObservable();
  }

  get _data(): ContainerElementData {
    return {
      ...super._data,
      content: this.content.map((content) => content.data),
      contentExpression: this.contentExpression,
    };
  }
  get _data$(): Observable<ContainerElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this._content$.pipe(
        switchMap((content) =>
          combineLatestOrEmpty(content.map((content) => content.data$)),
        ),
      ),
      this.contentExpression$,
    ]).pipe(
      map(([data, content, contentExpression]) => ({
        ...data,
        content,
        contentExpression,
      })),
    );
  }

  constructor({
    id,
    component,
    type,
  }: {
    id?: string;
    component: Component;
    type: string;
  }) {
    super({
      id,
      type,
      component,
    });

    this.addDisposer(() => {
      this.content.forEach((content) => content.dispose());
      this._content$.next([]);
      this._content$.complete();
    });

    ElementContainer.watchContent(this);
  }

  setContent(elements: Element[]): void {
    this._content$.next(elements);
  }
  setContentExpression(expression: Expression | undefined): void {
    this._contentExpression$.next(expression);
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

  restore(data: D) {
    super.restore(data);

    this._contentExpression$.next(data.contentExpression);

    // children
    Entity.restoreReactiveArray({
      datafiables$: this._content$,
      data: data.content,
      component: this.component,
    });
  }
}
