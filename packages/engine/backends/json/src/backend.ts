import type { Backend } from "@elllphnt/elementa-kernel";
import { JsonListState } from "./list.js";
import { JsonRecordState } from "./record.js";

export class JsonBackend implements Backend {
  createRecordState<T extends Record<string, any>>(
    init?: T
  ): JsonRecordState<T> {
    return new JsonRecordState({
      init: init || ({} as T),
      backend: this,
    });
  }
  createListState<T>(init?: T[]): JsonListState<T> {
    return new JsonListState({
      init: init || ([] as T[]),
      backend: this,
    });
  }
}

export const jsonBackend = new JsonBackend();
