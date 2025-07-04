import type {
  StyleFragmentData,
  StyleFragmentDataTypeMap,
  StyleFragmentType,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { Model } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";

export class StyleFragmentRegistry<K extends string = string> extends Model<
  RecordState<{ [k in K]?: StyleFragmentData[] }>
> {
  readonly propertyKey: K;

  constructor({
    propertyKey,
    state,
  }: {
    propertyKey: K;
    state: RecordState<{ [k in K]?: StyleFragmentData[] }>;
  }) {
    super({ state });
    this.propertyKey = propertyKey;
  }

  get allFragments(): StyleFragmentData[] {
    return this.state.entry(this.propertyKey) || [];
  }

  get allFragments$(): Observable<StyleFragmentData[]> {
    return this.state
      .entry$(this.propertyKey)
      .pipe(map((fragments) => fragments || []));
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
    this.state.set(this.propertyKey, fragments);
    return fragment;
  }

  setFragmentData<T extends StyleFragmentType>(
    id: string,
    data: StyleFragmentDataTypeMap[T]
  ): void {
    const fragments = this.allFragments.map((f) =>
      f.id === id ? { ...f, ...data } : f
    );
    this.state.set(this.propertyKey, fragments);
  }

  removeFragment(id: string): void {
    const fragments = this.allFragments.filter((f) => f.id !== id);
    this.state.set(this.propertyKey, fragments);
  }

  restore(data: StyleFragmentData[]): void {
    this.state.set(this.propertyKey, data || []);
  }
}
