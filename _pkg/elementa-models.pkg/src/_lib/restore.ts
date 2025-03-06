import _ from "lodash";
import { BehaviorSubject, Observable } from "rxjs";

export interface Datafiable<D> {
  get data(): D;
  restore(data: D): void;
}

export type Datafier<D, d> = (datafiable: D) => d;
export type Datafier$<D, d> = (datafiable: D) => Observable<d>;
export type Creator<D, d> = (data: d) => D;
export type Restorer<D, d> = (datafiable: D, data: d) => void;
export type Disposer<D> = (disposable: D) => void;
export type Identifier<D> = (datafiable: D) => string | number;

export function restoreReactiveObject<D, d>({
  datafiable$,
  data,
  create,
  restore,
  dispose,
  identifyData,
  identifyDatafiable,
}: {
  datafiable$: BehaviorSubject<D | undefined>;
  data: d | undefined;
  create: Creator<D, d>;
  restore: Restorer<D, d>;
  dispose: Disposer<D>;
  identifyData: Identifier<d>;
  identifyDatafiable: Identifier<D>;
}): void {
  const current = datafiable$.value;
  if (data === undefined) {
    // removed
    if (current !== undefined) {
      datafiable$.next(undefined);
      dispose(current);
    }
  } else {
    if (current) {
      const currentId = identifyDatafiable(current);
      const dataId = identifyData(data);

      if (currentId === dataId) {
        // updated
        restore(current, data);
      } else {
        // replaced
        const next = create(data);
        restore(next, data);
        datafiable$.next(next);
        dispose(current);
      }
    } else {
      // created
      const datafiable = create(data);
      restore(datafiable, data);
      datafiable$.next(datafiable);
    }
  }
}

export function restoreReactiveMap<D, d>({
  datafiable$,
  data,
  create,
  restore,
  dispose,
}: {
  datafiable$: BehaviorSubject<Record<string, D>>;
  data: Record<string, d> | undefined;
  create: Creator<D, d>;
  restore: Restorer<D, d>;
  dispose: Disposer<D>;
}): void {
  const current = { ...datafiable$.value };
  if (data === undefined) {
    const toDispose = Object.values(current);
    if (toDispose.length > 0) {
      toDispose.forEach(dispose);
      datafiable$.next({});
    }
  } else {
    const next = {} as Record<string, D>;
    const removed = { ...current } as Record<string, D>;
    const added = {} as Record<string, D>;
    const restored = {} as Record<string, D>;

    for (const key in data) {
      const currentDatafiable = current[key];
      const nextData = data[key];
      if (nextData === undefined) {
        // removed
        continue;
      } else {
        if (currentDatafiable) {
          // updated
          restore(currentDatafiable, nextData);
          delete removed[key];
        } else {
          // created
          const nextDatafiable = create(nextData);
          restore(nextDatafiable, nextData);
          next[key] = nextDatafiable;
          added[key] = nextDatafiable;
        }
      }
    }

    if (!_.isEmpty(removed) || !_.isEmpty(added)) {
      datafiable$.next(next);

      for (const datafiable of Object.values(removed)) {
        dispose(datafiable);
      }
    }
  }
}

export function restoreReactiveArray<D, d>({
  datafiables$,
  data,
  create,
  restore,
  dispose,
  identifyData,
  identifyDatafiable,
}: {
  datafiables$: BehaviorSubject<D[]>;
  data: d[] | undefined;
  create: Creator<D, d>;
  restore: Restorer<D, d>;
  dispose: Disposer<D>;
  identifyData: Identifier<d>;
  identifyDatafiable: Identifier<D>;
}): void {
  const current = [...datafiables$.value];
  if (data === undefined) {
    if (current.length > 0) {
      current.forEach(dispose);
      datafiables$.next([]);
    }
  } else {
    const next = [] as D[];
    const removed = Object.fromEntries(
      current.map((datafiable) => [identifyDatafiable(datafiable), datafiable]),
    ) as Record<string, D>;
    const added = [] as D[];

    for (let i = 0; i < data.length; i++) {
      const dataItem = data[i];
      const id = identifyData(dataItem);
      const datafiable = removed[id];
      if (dataItem === undefined) {
        // datafiable is removed
        continue;
      } else {
        if (datafiable) {
          // datafiable is updated
          restore(datafiable, dataItem);
          next.push(datafiable);
        } else {
          // datafiable is added
          const newDatafiable = create(dataItem);
          restore(newDatafiable, dataItem);
          next.push(newDatafiable);
          added.push(newDatafiable);
        }
        delete removed[id];
      }
    }

    if (!_.isEmpty(removed) || !_.isEmpty(added)) {
      datafiables$.next(next);

      for (const datafiable of Object.values(removed)) {
        dispose(datafiable);
      }
    }
  }
}
