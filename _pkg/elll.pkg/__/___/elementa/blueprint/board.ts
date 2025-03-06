import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { BoardData, NodeData } from "./_types";

export class Board extends Disposable implements Datafiable<BoardData> {
  private _state$ = new BehaviorSubject<BoardData>({});

  get data() {
    return this._state$.value;
  }
  get data$() {
    return this._state$.asObservable();
  }

  node(key: string) {
    return this.data.nodes?.[key];
  }
  node$(key: string) {
    return this.data$.pipe(map((data) => data.nodes?.[key]));
  }

  constructor() {
    super();

    this.addDisposer(() => {});
  }

  updateNode(key: string, data: Partial<NodeData>): void {
    this._state$.next({
      ...this.data,
      nodes: {
        ...this.data.nodes,
        [key]: {
          ...this.data.nodes?.[key],
          ...data,
        },
      },
    });
  }

  restore(data: BoardData): void {
    this._state$.next(data);
  }
}
