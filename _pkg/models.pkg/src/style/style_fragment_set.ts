import {
  StyleFragmentData,
  StyleFragmentDataTypeMap,
  StyleFragmentType,
} from "@elllphnt/elll-element/types/_primitives/style/fragments/fragment";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { genId } from "../_lib/id";

export class StyleFragmentRegistry
  extends Disposable
  implements Datafiable<StyleFragmentData[]>
{
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  key = `${StyleFragmentRegistry.keySeed}-${StyleFragmentRegistry.key++}`;

  private _fragment$ = new BehaviorSubject<Record<string, StyleFragmentData>>(
    {},
  );

  get data() {
    return Object.values(this._fragment$.value);
  }
  get data$() {
    return this._fragment$.asObservable().pipe(map(Object.values));
  }

  fragment<T extends StyleFragmentType>(
    type: T,
    id: string,
  ): StyleFragmentData<T> | undefined {
    const fragment = this._fragment$.value[id];
    if (fragment && fragment.type === type) {
      return fragment as StyleFragmentData<T>;
    } else {
      return undefined;
    }
  }
  fragment$<T extends StyleFragmentType>(
    type: T,
    id: string,
  ): Observable<StyleFragmentData<T> | undefined> {
    return this._fragment$.pipe(
      map((fragments) => fragments[id]),
      map((fragment) =>
        fragment && fragment.type === type
          ? (fragment as StyleFragmentData<T>)
          : undefined,
      ),
    );
  }

  fragments$<T extends StyleFragmentType>(
    type: T,
  ): Observable<StyleFragmentData<T>[]> {
    return this._fragment$.pipe(
      map(
        (fragments) =>
          Object.values(fragments).filter(
            (fragment) => fragment.type === type,
          ) as StyleFragmentData<T>[],
      ),
    );
  }
  fragments<T extends StyleFragmentType>(type: T): StyleFragmentData<T>[] {
    return Object.values(this._fragment$.value).filter(
      (fragment) => fragment.type === type,
    ) as StyleFragmentData<T>[];
  }

  get allFragments$(): Observable<StyleFragmentData[]> {
    return this.data$;
  }
  get allFragments(): StyleFragmentData[] {
    return this.data;
  }

  constructor() {
    super();

    this.addDisposer(() => {
      this._fragment$.complete();
    });
  }

  addFragment<T extends StyleFragmentType>(
    type: T,
    data: StyleFragmentDataTypeMap[T],
  ): StyleFragmentData<T> {
    const fragment: StyleFragmentData<T> = {
      _id: genId(),
      type,
      data,
    };

    this._fragment$.next({
      ...this._fragment$.value,
      [fragment._id]: fragment,
    });

    return fragment;
  }
  setFragmentData<T extends StyleFragmentType>(
    id: string,
    data: StyleFragmentDataTypeMap[T],
  ): void {
    const fragment = this._fragment$.value[id];
    if (fragment) {
      this._fragment$.next({
        ...this._fragment$.value,
        [id]: { ...fragment, data },
      });
    }
  }
  removeFragment(id: string): void {
    const { [id]: _, ...fragments } = this._fragment$.value;
    this._fragment$.next(fragments);
  }

  restore(data: StyleFragmentData[]): void {
    this._fragment$.next(Object.fromEntries(data.map((d) => [d._id, d])));
  }
}
