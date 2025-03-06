import { SlotElement } from "@repo/elementa-models";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { makeElementInstance } from "~/src/_lib/make_element_instance";
import { ElementInstance, FragmentEnvironment } from "../_";
import { Instance } from "../instance";
import { SlotInstanceStyle } from "./style";

export class SlotInstance extends Instance<SlotElement> {
  readonly environment: FragmentEnvironment;
  readonly style: SlotInstanceStyle;

  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

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
      map((styleModifiers) => [...styleModifiers].sort().join(":")),
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
    this.style = new SlotInstanceStyle({
      slot: this,
    });

    const contentSubscription = combineLatestOrEmpty([
      this.fill$.pipe(switchMap((slot) => slot?.content$ ?? of([]))),
      this.fill$.pipe(
        switchMap((slot) => slot?.contentExpression$ ?? of(undefined)),
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
      this.style.dispose();
      contentSubscription.unsubscribe();
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();
    });
  }
}
