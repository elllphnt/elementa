import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { nextKey, updateYArray } from "./_utils";

export type ReactiveList<T> = y.Array<T> & {
  key: number;
  observable$: Observable<T[]>;
  restore(data: T[]): void;
  dispose(): void;
};

export function attachReactiveList<T>(
  yArray: y.Array<T>
): yArray is ReactiveList<T> {
  const rxlist = yArray as ReactiveList<T>;
  const subject$ = new BehaviorSubject<T[]>(yArray.doc ? yArray.toArray() : []);

  const observer = () => subject$.next(yArray.toArray());
  yArray.observe(observer);

  rxlist.key = nextKey();
  rxlist.observable$ = subject$.asObservable();

  rxlist.restore = (data: T[]): void => {
    updateYArray(yArray, data);
  };

  rxlist.dispose = () => {
    yArray.unobserve(observer);
    subject$.complete();
  };

  return true;
}

export function createReactiveList<T>(): ReactiveList<T> {
  const yarray = new y.Array<T>();
  if (attachReactiveList(yarray)) {
    return yarray;
  } else {
    throw new Error("Failed to attach reactive list");
  }
}
