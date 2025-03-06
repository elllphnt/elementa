import { init } from "@paralleldrive/cuid2";
import { combineLatestOrEmpty, Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import {
  ComponentData,
  DisplayData,
  InteractionData,
  LinkData,
} from "./_types";

export class Component extends Disposable implements Datafiable<ComponentData> {
  static generateId = init({
    length: 7,
  });

  readonly id: string;
  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _description$ = new BehaviorSubject<string | undefined>(undefined);
  private _displays$ = new BehaviorSubject<Record<string, DisplayData>>({});
  private _interactions$ = new BehaviorSubject<Record<string, InteractionData>>(
    {},
  );
  private _links$ = new BehaviorSubject<Record<string, LinkData>>({});

  get name$() {
    return this._name$;
  }
  get name() {
    return this._name$.value;
  }

  get description$() {
    return this._description$;
  }
  get description() {
    return this._description$.value;
  }

  get displays$() {
    return this._displays$;
  }
  get displays() {
    return this._displays$.value;
  }
  display(name: string) {
    return this.displays[name] as DisplayData | undefined;
  }
  display$(name: string) {
    return this.displays$.pipe(
      map((displays) => displays[name] as DisplayData | undefined),
    );
  }

  get interactions$() {
    return this._interactions$;
  }
  get interactions() {
    return this._interactions$.value;
  }
  interaction(name: string) {
    return this.interactions[name] as InteractionData | undefined;
  }
  interaction$(name: string) {
    return this.interactions$.pipe(
      map((interactions) => interactions[name] as InteractionData | undefined),
    );
  }

  get links$() {
    return this._links$;
  }
  get links() {
    return this._links$.value;
  }
  link(name: string) {
    return this.links[name] as LinkData | undefined;
  }
  link$(name: string) {
    return this.links$.pipe(
      map((links) => links[name] as LinkData | undefined),
    );
  }

  get data(): ComponentData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      displays: this.displays,
      interactions: this.interactions,
      links: this.links,
    };
  }
  get data$() {
    return combineLatestOrEmpty([
      this.name$,
      this.description$,
      this.displays$,
      this.interactions$,
      this.links$,
    ]).pipe(
      map(([name, description, displays, interactions, links]) => ({
        id: this.id,
        name,
        description,
        displays,
        interactions,
        links,
      })),
    );
  }

  constructor({ id }: { id?: string } = {}) {
    super();
    this.id = id ?? Component.generateId();
  }

  setName(name: string): void {
    this._name$.next(name);
  }
  setDescription(description: string): void {
    this._description$.next(description);
  }
  setDisplay(name: string, data: DisplayData): void {
    this._displays$.next({
      ...this.displays,
      [name]: data,
    });
  }
  setInteraction(name: string, data: InteractionData): void {
    this._interactions$.next({
      ...this.interactions,
      [name]: data,
    });
  }
  setLink(name: string, data: LinkData): void {
    this._links$.next({
      ...this.links,
      [name]: data,
    });
  }

  restore(data: Omit<ComponentData, "id">): void {
    this._name$.next(data.name);
    this._description$.next(data.description);
    this._displays$.next(data.displays ?? {});
    this._interactions$.next(data.interactions ?? {});
    this._links$.next(data.links ?? {});
  }
}
