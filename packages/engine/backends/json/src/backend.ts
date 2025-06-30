import { Backend } from "@elllphnt/elementa-kernel";
import { JsonListState } from "./list.js";
import { JsonRecordState } from "./record.js";

export class JsonBackend implements Backend {
  createRecordState<T extends Record<string, any>>(
    init?: T
  ): JsonRecordState<T> {
    const state = new JsonRecordState({
      init: init || ({} as T),
      backend: this,
    });
    state.initialize();
    return state;
  }
  createListState<T>(init?: T[]): JsonListState<T> {
    const state = new JsonListState({
      init: init || ([] as T[]),
      backend: this,
    });
    state.initialize();
    return state;
  }
}

export const jsonBackend = new JsonBackend();
