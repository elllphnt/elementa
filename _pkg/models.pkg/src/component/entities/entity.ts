import { EntityData } from "@elllphnt/elll-element";
import { init } from "@paralleldrive/cuid2";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import {
  restoreReactiveArray,
  restoreReactiveObject,
} from "~/src/_lib/restore";
import { stripObjectFields } from "~/src/_lib/strip_object_fields";
import { makeElementaEntityResourceId, makeElementaUrl } from "~/src/_lib/url";
import { Component } from "../component";

export abstract class Entity<
  D extends EntityData = EntityData,
> extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  key = `${Entity.keySeed}-${Entity.key++}`;

  static createId = init({
    length: 7,
  });

  readonly id: string;
  readonly type: string;
  readonly component: Component;

  get resourceId() {
    return makeElementaEntityResourceId({
      componentUrl: this.component.url,
      entityId: this.id,
    });
  }
  get url() {
    return makeElementaUrl({
      resourceType: "entity",
      resourceId: this.resourceId,
    });
  }

  private _name$ = new BehaviorSubject<string | undefined>(undefined);

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  protected get _data(): EntityData {
    return {
      _id: this.id,
      type: this.type,
      name: this.name,
    };
  }
  protected get _data$(): Observable<EntityData> {
    return combineLatestOrEmpty([this._name$]).pipe(
      map(([name]) => ({
        _id: this.id,
        type: this.type,
        name,
      })),
    );
  }

  get project() {
    return this.component.project;
  }

  editorStateKey(key: string) {
    return `entities.${this.id}.${key}`;
  }

  abstract get data(): D;
  abstract get data$(): Observable<D>;

  /**
   * Returns the data of the entity without the id.
   * Useful for context where only the definition of the entity is needed.
   * For example, when cloning an entity.
   */
  get definitionData(): D {
    const data = stripObjectFields(this.data, ["_id"]);
    return data;
  }

  constructor({
    id,
    type,
    component,
  }: {
    id?: string;
    type: string;
    component: Component;
  }) {
    super();

    this.id = id || Entity.createId();
    this.type = type;
    this.component = component;

    this.component.registerEntity(this);
    this.addDisposer(() => {
      this.component.unregisterEntity(this);
    });
  }

  abstract remove(): void;

  clone(): Entity {
    const clone = this.component.createEntity({ type: this.type });
    clone.restore(this.definitionData);
    return clone;
  }

  setName(name: string | undefined) {
    this._name$.next(name);
  }

  restore(data: D): void {
    if (data._id && data._id !== this.id) {
      throw new Error("Cannot restore entity with different id");
    }
    this._name$.next(data.name);
  }

  static restoreReactiveArray<d extends EntityData, D extends Entity<d>>({
    component,
    datafiables$,
    data,
  }: {
    component: Component;
    datafiables$: BehaviorSubject<D[]>;
    data: d[] | undefined;
  }) {
    return restoreReactiveArray<D, d>({
      datafiables$,
      data,
      create: (data) => {
        return component.createEntity({ id: data._id, type: data.type }) as D;
      },
      restore: (datafiable, data) => {
        datafiable.restore(data);
      },
      dispose: (datafiable) => {
        datafiable.dispose();
      },
      identifyData: (data) => {
        return data._id ?? "";
      },
      identifyDatafiable: (datafiable) => {
        return datafiable.id;
      },
    });
  }
  static restoreReactiveObject<d extends EntityData, D extends Entity<d>>({
    component,
    datafiable$,
    data,
  }: {
    component: Component;
    datafiable$: BehaviorSubject<D | undefined>;
    data: d | undefined;
  }) {
    return restoreReactiveObject<D, d>({
      datafiable$,
      data,
      create: (data) => {
        return component.createEntity({ id: data._id, type: data.type }) as D;
      },
      restore: (datafiable, data) => {
        datafiable.restore(data);
      },
      dispose: (datafiable) => {
        datafiable.dispose();
      },
      identifyData: (data) => {
        return data._id ?? "";
      },
      identifyDatafiable: (datafiable) => {
        return datafiable.id;
      },
    });
  }
}
