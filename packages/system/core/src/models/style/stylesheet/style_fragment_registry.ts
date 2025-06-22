import {
  StyleFragmentData,
  StyleFragmentDataTypeMap,
  StyleFragmentType,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export interface StyleFragmentRegistry {
  fragment<T extends StyleFragmentType>(
    type: T,
    id: string
  ): StyleFragmentData<T> | undefined;

  fragment$<T extends StyleFragmentType>(
    type: T,
    id: string
  ): Observable<StyleFragmentData<T> | undefined>;

  fragments<T extends StyleFragmentType>(type: T): StyleFragmentData<T>[];
  fragments$<T extends StyleFragmentType>(
    type: T
  ): Observable<StyleFragmentData<T>[]>;

  allFragments: StyleFragmentData[];
  allFragments$: Observable<StyleFragmentData[]>;

  addFragment<T extends StyleFragmentType>(
    type: T,
    data: StyleFragmentDataTypeMap[T]
  ): StyleFragmentData<T>;

  setFragmentData<T extends StyleFragmentType>(
    id: string,
    data: StyleFragmentDataTypeMap[T]
  ): void;

  removeFragment(id: string): void;
  restore(data: StyleFragmentData[]): void;
}
