/* eslint-disable @typescript-eslint/no-unused-vars */
import { BehaviorSubject, map } from "rxjs";
import { beforeEach, expect, test, vi } from "vitest";
import { Model } from "~/models/model.js";
import { AggregatedModelRecord } from "~/models/model_record.js";
import { State } from "~/state/state.js";
import { AggregatedStateRecord } from "~/state/state_record.js";

// Mock implementations for testing
class MockState extends State {
  constructor() {
    super();
  }
}

class MockModel extends Model<MockState> {
  constructor({ state }: { state: MockState }) {
    super({ state });
  }
}

class MockAggregatedStateRecord extends AggregatedStateRecord<MockState> {
  private _record$ = new BehaviorSubject<Record<string, MockState | undefined>>(
    {}
  );

  constructor(initialRecord: Record<string, MockState | undefined> = {}) {
    super();
    this._record$.next({ ...initialRecord });

    this.addDisposer(() => {
      this._record$.complete();
    });
  }

  get record(): Record<string, MockState | undefined> {
    return this._record$.value;
  }

  get record$() {
    return this._record$.asObservable();
  }

  entry(key: string): MockState | undefined;
  entry(key: string, create: true): MockState;
  entry(key: string, create?: boolean): MockState | undefined {
    const existing = this.record[key];
    if (existing || !create) {
      return existing;
    }
    const newState = new MockState();
    this.set(key, newState);
    return newState;
  }

  entry$(key: string): import("rxjs").Observable<MockState | undefined>;
  entry$(key: string, create: true): import("rxjs").Observable<MockState>;
  entry$(
    key: string,
    create?: boolean
  ): import("rxjs").Observable<MockState | undefined> {
    if (create === true) {
      return this._record$.pipe(
        map((record) => {
          const existing = record[key];
          if (existing) {
            return existing;
          }
          // For the observable version with create=true, we need to ensure a value exists
          const newState = new MockState();
          this.set(key, newState);
          return newState;
        })
      );
    }
    return this._record$.pipe(map((record) => record[key]));
  }

  set(key: string, state: MockState | undefined): void {
    const current = { ...this.record };
    current[key] = state;
    this._record$.next(current);
  }

  remove(key: string): MockState | undefined {
    const current = { ...this.record };
    const removed = current[key];
    delete current[key];
    this._record$.next(current);
    return removed;
  }

  clear(): MockState[] {
    const removed = Object.values(this.record).filter(Boolean) as MockState[];
    this._record$.next({});
    return removed;
  }

  // Required abstract methods from RecordState
  setAll(data: Partial<Record<string, MockState | undefined>>): void {
    const current = { ...this.record, ...data };
    this._record$.next(current);
  }

  removeAll(keys: string[]): void {
    const current = { ...this.record };
    keys.forEach((key) => delete current[key]);
    this._record$.next(current);
  }

  setRecord(data: Record<string, MockState | undefined>): void {
    this._record$.next({ ...data });
  }

  getRecordState(_key: string | number): any {
    throw new Error("getRecordState not implemented in mock");
  }

  getListState(_key: string | number): any {
    throw new Error("getListState not implemented in mock");
  }

  getAggregatedStateRecord(_key: string | number): any {
    throw new Error("getAggregatedStateRecord not implemented in mock");
  }

  getAggregatedStateList(_key: string | number): any {
    throw new Error("getAggregatedStateList not implemented in mock");
  }

  getValueState(_key: string | number): any {
    throw new Error("getValueState not implemented in mock");
  }
}

let mockStateRecord: MockAggregatedStateRecord;
let createModelSpy: ReturnType<typeof vi.fn>;
let modelRecord: AggregatedModelRecord<MockState, MockModel>;

beforeEach(() => {
  createModelSpy = vi.fn((state: MockState, key: string, init?: boolean) => {
    return new MockModel({ state });
  });
});

test("initializes model from state if state has value", () => {
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  expect(createModelSpy).toHaveBeenCalledWith(initialState, "test", true);
  expect(modelRecord.models["test"]).toBeInstanceOf(MockModel);
  expect(modelRecord.models["test"]?.state).toBe(initialState);
});

test("initializes with undefined if state value is undefined", () => {
  mockStateRecord = new MockAggregatedStateRecord({
    test: undefined,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  expect(createModelSpy).not.toHaveBeenCalled();
  expect(modelRecord.models["test"]).toBeUndefined();
});

test("model$ emits current model on construction", () => {
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  const emissions: Record<string, MockModel>[] = [];
  modelRecord.models$.subscribe((models) => emissions.push(models as any));

  expect(emissions).toHaveLength(1);
  expect(emissions[0]["test"]).toBeInstanceOf(MockModel);
});

test("reuses model if incoming state value is the same instance", () => {
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });
  modelRecord.initialize();

  const initialModel = modelRecord.models["test"];
  createModelSpy.mockClear();

  // Set the same state instance
  mockStateRecord.set("test", initialState);

  // Should not create a new model for the same state instance
  expect(createModelSpy).not.toHaveBeenCalled();
  expect(modelRecord.models["test"]).toBe(initialModel);
});

test("disposes previous model and creates new one if state value changes", () => {
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });
  modelRecord.initialize();

  const initialModel = modelRecord.models["test"];
  const disposeSpy = vi.spyOn(initialModel, "dispose");

  const newState = new MockState();
  mockStateRecord.set("test", newState);

  expect(disposeSpy).toHaveBeenCalled();
  expect(modelRecord.models["test"].state).toBe(newState);
});

test("sets new model using set() and updates state accordingly", () => {
  mockStateRecord = new MockAggregatedStateRecord();
  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  const newState = new MockState();
  const newModel = new MockModel({ state: newState });

  modelRecord.set("test", newModel);

  expect(modelRecord.models["test"]).toBe(newModel);
  expect(mockStateRecord.record["test"]).toBe(newState);
});

test("clears current model and state using clear()", () => {
  // The OptionalModel doesn't have a clear method, but AggregatedModelRecord has remove()
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  const initialModel = modelRecord.models["test"];
  const disposeSpy = vi.spyOn(initialModel, "dispose");

  modelRecord.remove("test");

  expect(disposeSpy).toHaveBeenCalled();
  expect(modelRecord.models["test"]).toBeUndefined();
  expect(mockStateRecord.record["test"]).toBeUndefined();
});

test("does nothing when calling clear() on already undefined model", () => {
  mockStateRecord = new MockAggregatedStateRecord();
  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  // Should not throw any errors
  expect(() => modelRecord.remove("nonexistent")).not.toThrow();
  expect(modelRecord.models["nonexistent"]).toBeUndefined();
});

test("completes model$ and disposes model on lifecycle disposal", () => {
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });
  modelRecord.initialize();

  const currentModel = modelRecord.models["test"];
  const disposeSpy = vi.spyOn(currentModel, "dispose");
  let completedCount = 0;

  modelRecord.models$.subscribe({
    complete: () => completedCount++,
  });

  modelRecord.dispose();

  expect(disposeSpy).toHaveBeenCalled();
  expect(completedCount).toBe(1);
});

test("disposes state on lifecycle disposal", () => {
  mockStateRecord = new MockAggregatedStateRecord();
  const stateDisposeSpy = vi.spyOn(mockStateRecord, "dispose");

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  modelRecord.dispose();

  expect(stateDisposeSpy).toHaveBeenCalled();
});

test("does not leak subscriptions after dispose", () => {
  mockStateRecord = new MockAggregatedStateRecord();
  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });
  modelRecord.initialize();

  modelRecord.dispose();

  // After disposal, state changes should not affect the disposed model
  const newState = new MockState();
  mockStateRecord.set("test", newState);

  // The createModelSpy should not be called after disposal
  expect(createModelSpy).toHaveBeenCalledTimes(0);
});

test("calling set() with undefined clears model and state", () => {
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });
  modelRecord.initialize();

  // Set to undefined by removing from state
  mockStateRecord.set("test", undefined);

  expect(modelRecord.models["test"]).toBeUndefined();
  expect(mockStateRecord.record["test"]).toBeUndefined();
});

test("calling set() with same model reuses model and updates state", () => {
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  const existingModel = modelRecord.models["test"];

  // Set the same model instance
  modelRecord.set("test", existingModel);

  expect(modelRecord.models["test"]).toBe(existingModel);
  expect(mockStateRecord.record["test"]).toBe(initialState);
});

test("model getter reflects current BehaviorSubject value", () => {
  const initialState = new MockState();
  mockStateRecord = new MockAggregatedStateRecord({
    test: initialState,
  });

  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });

  const models = modelRecord.models;
  expect(models["test"]).toBeInstanceOf(MockModel);
  expect(models["test"].state).toBe(initialState);
});

test("model$ emits updates reactively when model changes", () => {
  mockStateRecord = new MockAggregatedStateRecord();
  modelRecord = new AggregatedModelRecord({
    state: mockStateRecord,
    create: createModelSpy,
  });
  modelRecord.initialize();

  const emissions: Record<string, MockModel>[] = [];
  modelRecord.models$.subscribe((models) => emissions.push({ ...models }));

  const initialEmissionCount = emissions.length;

  const newState = new MockState();
  mockStateRecord.set("test", newState);

  expect(emissions).toHaveLength(initialEmissionCount + 1);
  expect(emissions[emissions.length - 1]["test"]?.state).toBe(newState);
});
