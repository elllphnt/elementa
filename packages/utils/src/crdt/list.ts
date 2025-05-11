import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { assert } from "../core/assert";
import { setEnhancer } from "../core/enhancer";
import { nextKey, setObjectGetter, setObjectProperty } from "./_utils";

export type ReactiveList<T> = {
  key: number;
  items: T[];
  items$: Observable<T[]>;
  dispose(): void;
};

export function attachReactiveList<T>(
  rxList: y.Array<T>
): rxList is y.Array<T> & ReactiveList<T> {
  const subject$ = new BehaviorSubject<T[]>(rxList.doc ? rxList.toArray() : []);

  const observer = () => subject$.next(rxList.toArray());
  rxList.observe(observer);

  assert(setObjectProperty(rxList, "key", nextKey()));
  assert(setObjectProperty(rxList, "items$", subject$));
  assert(setObjectGetter(rxList, "items", () => rxList.toArray()));
  assert(
    setObjectProperty(rxList, "dispose", () => {
      rxList.unobserve(observer);
      subject$.complete();
    })
  );

  return setEnhancer<ReactiveList<T>>(rxList, attachReactiveList);
}
