import {
  StyleFragmentData,
  StyleFragmentDataTypeMap,
  StyleFragmentType,
} from "@elllphnt/elementa-base";
import { ListCRDTModel } from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { genId } from "../_lib/id";

export class StyleFragmentRegistry extends ListCRDTModel<StyleFragmentData> {
  private readonly _fragmentsById$ = new BehaviorSubject<
    Record<string, StyleFragmentData>
  >({});

  fragment<T extends StyleFragmentType>(
    type: T,
    id: string
  ): StyleFragmentData<T> | undefined {
    const frag = this._fragmentsById$.value[id];
    return frag?.type === type ? (frag as StyleFragmentData<T>) : undefined;
  }

  fragment$<T extends StyleFragmentType>(
    type: T,
    id: string
  ): Observable<StyleFragmentData<T> | undefined> {
    return this._fragmentsById$.pipe(
      map((fragMap) => {
        const frag = fragMap[id];
        return frag?.type === type ? (frag as StyleFragmentData<T>) : undefined;
      }),
      distinctUntilChanged()
    );
  }

  fragments<T extends StyleFragmentType>(type: T): StyleFragmentData<T>[] {
    return this.state.filter((f) => f.type === type) as StyleFragmentData<T>[];
  }
  fragments$<T extends StyleFragmentType>(
    type: T
  ): Observable<StyleFragmentData<T>[]> {
    return this.state$.pipe(
      map((arr) => arr.filter((f) => f.type === type) as StyleFragmentData<T>[])
    );
  }

  get allFragments(): StyleFragmentData[] {
    return this.state;
  }
  get allFragments$(): Observable<StyleFragmentData[]> {
    return this.state$;
  }

  constructor(yarray: y.Array<any>) {
    super(yarray);

    const sub = this.state$
      .pipe(
        map(
          (arr) =>
            Object.fromEntries(arr.map((f) => [f.id, f])) as Record<
              string,
              StyleFragmentData
            >
        )
      )
      .subscribe(this._fragmentsById$);

    this.addDisposer(() => sub.unsubscribe());
  }

  addFragment<T extends StyleFragmentType>(
    type: T,
    data: StyleFragmentDataTypeMap[T]
  ): StyleFragmentData<T> {
    const fragment: StyleFragmentData<T> = { id: genId(), type, data };
    this.push(fragment);
    return fragment;
  }

  setFragmentData<T extends StyleFragmentType>(
    id: string,
    data: StyleFragmentDataTypeMap[T]
  ): void {
    const idx = this.state.findIndex((f) => f.id === id);
    if (idx >= 0) {
      const updated = { ...this.state[idx], data };
      this.transact(() => {
        this.delete(idx);
        this.insert(idx, updated);
      });
    }
  }

  removeFragment(id: string): void {
    const idx = this.state.findIndex((f) => f.id === id);
    if (idx >= 0) {
      this.delete(idx);
    }
  }

  restore(data: StyleFragmentData[]): void {
    this.set(data);
  }
}
