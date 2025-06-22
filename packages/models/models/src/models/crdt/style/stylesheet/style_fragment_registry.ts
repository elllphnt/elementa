import { ensureField } from "@elllphnt/crdt";
import {
  StyleFragmentData,
  StyleFragmentDataTypeMap,
  StyleFragmentType,
} from "@elllphnt/elementa-base";
import { StyleFragmentRegistry } from "@elllphnt/elementa-core";
import { CrdtModel, CrdtRecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";

export class CrdtStyleFragmentRegistry
  extends CrdtModel<y.Map<any>>
  implements StyleFragmentRegistry
{
  private _state: CrdtRecordState<{ fragments: StyleFragmentData[] }>;

  constructor({
    crdt,
    initialized,
  }: {
    crdt: y.Map<any>;
    initialized?: boolean;
  }) {
    super({ crdt });

    if (!initialized) {
      ensureField(crdt, "fragments", () => []);
      ensureField(crdt, "__crdtAtomic", () => ["fragments[*]"]);
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get allFragments(): StyleFragmentData[] {
    return this._state.entry("fragments") || [];
  }

  get allFragments$(): Observable<StyleFragmentData[]> {
    return this._state.entry$("fragments");
  }

  fragment<T extends StyleFragmentType>(
    type: T,
    id: string
  ): StyleFragmentData<T> | undefined {
    return this.allFragments.find((f) => f.id === id && f.type === type) as
      | StyleFragmentData<T>
      | undefined;
  }

  fragment$<T extends StyleFragmentType>(
    type: T,
    id: string
  ): Observable<StyleFragmentData<T> | undefined> {
    return this.allFragments$.pipe(
      map(
        (fragments) =>
          fragments.find((f) => f.id === id && f.type === type) as
            | StyleFragmentData<T>
            | undefined
      )
    );
  }

  fragments<T extends StyleFragmentType>(type: T): StyleFragmentData<T>[] {
    return this.allFragments.filter(
      (f) => f.type === type
    ) as StyleFragmentData<T>[];
  }

  fragments$<T extends StyleFragmentType>(
    type: T
  ): Observable<StyleFragmentData<T>[]> {
    return this.allFragments$.pipe(
      map(
        (fragments) =>
          fragments.filter((f) => f.type === type) as StyleFragmentData<T>[]
      )
    );
  }

  addFragment<T extends StyleFragmentType>(
    type: T,
    data: StyleFragmentDataTypeMap[T]
  ): StyleFragmentData<T> {
    const id = Math.random().toString(36).substring(2, 10);
    const fragment = { id, type, ...data } as StyleFragmentData<T>;
    const fragments = [...this.allFragments, fragment];
    this._state.set("fragments", fragments);
    return fragment;
  }

  setFragmentData<T extends StyleFragmentType>(
    id: string,
    data: StyleFragmentDataTypeMap[T]
  ): void {
    const fragments = this.allFragments.map((f) =>
      f.id === id ? { ...f, ...data } : f
    );
    this._state.set("fragments", fragments);
  }

  removeFragment(id: string): void {
    const fragments = this.allFragments.filter((f) => f.id !== id);
    this._state.set("fragments", fragments);
  }

  restore(data: StyleFragmentData[]): void {
    this._state.set("fragments", data || []);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtStyleFragmentRegistry({
      crdt,
      initialized: true,
    }) as this;
  }
}
