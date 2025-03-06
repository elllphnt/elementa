import { diff } from "deep-object-diff";
import { Observable } from "rxjs";
import { Datafiable } from "./datafiable";
import { History } from "./history";
import { stripUndefined } from "./misc";

export type SavableData = {
  version?: number;
};

export interface Savable<D extends SavableData> extends Datafiable<D> {
  readonly version: number;
  readonly history: History<D>;

  readonly saved: D | undefined;
  readonly saved$: Observable<D | undefined>;

  save(): void;
  undo(): void;
  redo(): void;
}

export class SavableMethods {
  static save<D extends SavableData>(savable: Savable<D>) {
    const data = savable.data;
    const saved = savable.saved;
    const current = savable.history.current;

    delete data.version;
    delete saved?.version;
    delete current?.version;

    const _diffSaved = diff(stripUndefined(saved ?? {}), stripUndefined(data));
    const _diffCurrent = diff(
      stripUndefined(current ?? {}),
      stripUndefined(data),
    );

    if (Object.keys(_diffCurrent).length > 0) {
      savable.history.push(data);
    }

    if (Object.keys(_diffSaved).length > 0) {
      return {
        ...data,
        version: savable.version + 1,
      };
    }
  }
  static undo<D extends SavableData>(savable: Savable<D>) {
    const data = savable.history.undo();
    if (data) {
      savable.restore({
        ...data,
        version: savable.version + 1,
      });
    }
  }
  static redo<D extends SavableData>(savable: Savable<D>) {
    const data = savable.history.redo();
    if (data) {
      savable.restore({
        ...data,
        version: savable.version + 1,
      });
    }
  }
}
