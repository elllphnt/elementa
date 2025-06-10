import {
  StyleFragmentData,
  StyleFragmentDataTypeMap,
  StyleFragmentType,
} from "@elllphnt/elementa-base";
import { Model } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { StyleFragmentRegistry } from "~/models/_.js";

export class StyleFragmentRegistryModel
  extends Model<StyleFragmentData[]>
  implements StyleFragmentRegistry
{
  private _fragments: BehaviorSubject<StyleFragmentData[]>;

  constructor({ init }: { init: StyleFragmentData[] }) {
    super();

    this._fragments = new BehaviorSubject<StyleFragmentData[]>(init || []);

    this.addDisposer(() => {
      this._fragments.complete();
    });
  }

  get data(): StyleFragmentData[] {
    return this._fragments.value;
  }

  get data$(): Observable<StyleFragmentData[]> {
    return this._fragments.asObservable();
  }

  restore(data: StyleFragmentData[]): void {
    this._fragments.next(data || []);
  }

  fragment<T extends StyleFragmentType>(
    type: T,
    id: string
  ): StyleFragmentData<T> | undefined {
    return this._fragments.value.find((f) => f.id === id && f.type === type) as
      | StyleFragmentData<T>
      | undefined;
  }

  fragment$<T extends StyleFragmentType>(
    type: T,
    id: string
  ): Observable<StyleFragmentData<T> | undefined> {
    return this._fragments.pipe(
      map(
        (fragments) =>
          fragments.find((f) => f.id === id && f.type === type) as
            | StyleFragmentData<T>
            | undefined
      )
    );
  }

  fragments<T extends StyleFragmentType>(type: T): StyleFragmentData<T>[] {
    return this._fragments.value.filter(
      (f) => f.type === type
    ) as StyleFragmentData<T>[];
  }

  fragments$<T extends StyleFragmentType>(
    type: T
  ): Observable<StyleFragmentData<T>[]> {
    return this._fragments.pipe(
      map(
        (fragments) =>
          fragments.filter((f) => f.type === type) as StyleFragmentData<T>[]
      )
    );
  }

  get allFragments(): StyleFragmentData[] {
    return this._fragments.value;
  }

  get allFragments$(): Observable<StyleFragmentData[]> {
    return this._fragments.asObservable();
  }

  addFragment<T extends StyleFragmentType>(
    type: T,
    data: StyleFragmentDataTypeMap[T]
  ): StyleFragmentData<T> {
    const id = Math.random().toString(36).substring(2, 10);
    const fragment = { id, type, ...data } as StyleFragmentData<T>;
    this._fragments.next([...this._fragments.value, fragment]);
    return fragment;
  }

  setFragmentData<T extends StyleFragmentType>(
    id: string,
    data: StyleFragmentDataTypeMap[T]
  ): void {
    const fragment = this._fragments.value.find((f) => f.id === id);
    if (fragment) {
      const updatedFragment = { ...fragment, ...data };
      this._fragments.next(
        this._fragments.value.map((f) => (f.id === id ? updatedFragment : f))
      );
    }
  }

  removeFragment(id: string): void {
    this._fragments.next(this._fragments.value.filter((f) => f.id !== id));
  }
}
