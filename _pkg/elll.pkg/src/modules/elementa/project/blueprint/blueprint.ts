import { IFileDrive } from "@repo/backend";
import { BehaviorSubject, map } from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { SynchronizedModelFile } from "../file";

export type NodeData = {
  position: {
    x: number;
    y: number;
  };
};
export type BlueprintData = {
  nodes?: Record<string, NodeData>;
};

export class Blueprint extends SynchronizedModelFile<BlueprintData> {
  private _data$ = new BehaviorSubject<BlueprintData>({});

  get sourceData$() {
    return this._modelSourceData$.pipe(map((data) => data ?? {}));
  }
  get data$() {
    return this._data$.asObservable();
  }

  get nodes() {
    return this._data$.getValue().nodes || {};
  }
  get nodes$() {
    return this._data$.pipe(map((data) => data.nodes || {}));
  }

  constructor({ elll, drive }: { elll: IElll; drive: IFileDrive }) {
    super({
      elll,
      drive,
      path: ".elll/blueprint",
      model: jsonModelConstructor.name,
    });

    this.watchData();
    this.addDisposer(() => {
      this._data$.complete();
    });
  }

  updateNode(id: string, data: Partial<NodeData>) {
    this._data$.next({
      ...this._data$.value,
      nodes: {
        ...this.nodes,
        [id]: {
          ...this.nodes[id],
          ...data,
        },
      },
    });
  }

  restore(data: BlueprintData): void {
    this._data$.next(data);
  }
}
