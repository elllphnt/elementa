import { SlotElement } from "@elllphnt/elementa-models";
import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { makeElementInstance } from "~/src/instances/elements/_create";
import { ElementInstance, FragmentEnvironment } from "../_";
import { Instance } from "../instance";
import { SlotInstanceStyle } from "./style";

export class SlotInstance extends Instance<SlotElement> {
  readonly environment: FragmentEnvironment;
  private _styles: Map<string, SlotInstanceStyle> = new Map();

  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  style(selector: string): SlotInstanceStyle {
    let style = this._styles.get(selector);
    if (!style) {
      style = new SlotInstanceStyle({
        slot: this,
        selector,
      });
      this._styles.set(selector, style);
    }
    return style;
  }

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get selector() {
    return [...this.environment.styleModifiers].sort().join(":");
  }
  get selector$() {
    return this.environment.styleModifiers$.pipe(
      map((styleModifiers) => [...styleModifiers].sort().join(":"))
    );
  }

  get fill() {
    return this.environment.slotFill(this.entity.id);
  }
  get fill$() {
    return this.environment.slotFill$(this.entity.id);
  }

  constructor({
    element,
    environment,
  }: {
    element: SlotElement;
    environment: FragmentEnvironment;
  }) {
    super({
      entity: element,
      elementa: environment.elementa,
      parent: null,
    });
    this.environment = environment;

    const contentSubscription = combineLatestOrEmpty([
      this.fill$.pipe(switchMap((slot) => slot?.content$ ?? of([]))),
      this.fill$.pipe(
        switchMap((slot) => slot?.contentExpression$ ?? of(undefined))
      ),
    ]).subscribe(([_content, contentExpression]) => {
      const content = contentExpression ? [] : _content;
      const newContent = updateInstanceList({
        instances: this.content,
        entities: content,
        createInstance: (element) =>
          makeElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
      });
      this._content$.next(newContent);
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();

      this._styles.forEach((style) => style.dispose());
    });
  }
}
