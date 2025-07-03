import type { ListState } from "./list.js";
import type { RecordState } from "./record.js";

export interface Backend {
  createRecordState<T extends Record<string, any>>(): RecordState<T>;
  createListState<T>(): ListState<T>;
}
