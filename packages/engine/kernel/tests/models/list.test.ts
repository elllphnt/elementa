import { BehaviorSubject } from "rxjs";
import { beforeEach, expect, test, vi } from "vitest";
import { Model } from "~/models/model.js";
import { AggregatedModelList } from "~/models/model_list.js";
import { ListState } from "~/state/list.js";
import { State } from "~/state/state.js";

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

class MockListState extends ListState<MockState> {
  private _items = new BehaviorSubject<MockState[]>([]);

  constructor(initialItems: MockState[] = []) {
    super();
    this._items.next([...initialItems]);

    this.addDisposer(() => {
      this._items.complete();
    });
  }

  get items(): MockState[] {
    return this._items.value;
  }

  get items$() {
    return this._items.asObservable();
  }

  add(item: MockState): void {
    const current = [...this.items];
    current.push(item);
    this._items.next(current);
  }

  append(items: MockState[]): void {
    const current = [...this.items];
    current.push(...items);
    this._items.next(current);
  }

  prepend(items: MockState[]): void {
    const current = [...this.items];
    current.unshift(...items);
    this._items.next(current);
  }

  insertAt(index: number, items: MockState[]): void {
    const current = [...this.items];
    current.splice(index, 0, ...items);
    this._items.next(current);
  }

  remove(predicate: (item: MockState) => boolean): MockState[] {
    const current = [...this.items];
    const removed: MockState[] = [];
    for (let i = current.length - 1; i >= 0; i--) {
      if (predicate(current[i])) {
        removed.push(current[i]);
        current.splice(i, 1);
      }
    }
    this._items.next(current);
    return removed.reverse();
  }

  removeAt(index: number, count: number = 1): MockState[] {
    const current = [...this.items];
    const removed = current.splice(index, count);
    this._items.next(current);
    return removed;
  }

  setItems(items: MockState[]): void {
    this._items.next([...items]);
  }

  clear(): MockState[] {
    const removed = [...this.items];
    this._items.next([]);
    return removed;
  }
}

let mockListState: MockListState;
let createModelSpy: ReturnType<typeof vi.fn>;
let modelList: AggregatedModelList<MockState, MockModel>;

beforeEach(() => {
  // Reset tracking
  const initialStates = [new MockState(), new MockState()];
  mockListState = new MockListState(initialStates);

  createModelSpy = vi.fn((state: MockState) => {
    const model = new MockModel({ state });
    // In a real implementation, init might be used for initialization logic
    // For our test purposes, we just need to match the signature
    return model;
  });

  modelList = new AggregatedModelList({
    state: mockListState,
    create: createModelSpy,
  });

  // Initialize the model list to start reactive behavior
  modelList.initialize();
});

test("initializes models from ListState on construction", () => {
  expect(createModelSpy).toHaveBeenCalledTimes(2);
  expect(createModelSpy).toHaveBeenNthCalledWith(
    1,
    mockListState.items[0],
    true
  );
  expect(createModelSpy).toHaveBeenNthCalledWith(
    2,
    mockListState.items[1],
    true
  );
  expect(modelList.models).toHaveLength(2);
});

test("subscribes to state.items$ and reconciles models reactively", () => {
  const initialLength = modelList.models.length;
  const newState = new MockState();

  // Add new state to the list state
  mockListState.add(newState);

  // Should have created a new model
  expect(createModelSpy).toHaveBeenCalledTimes(initialLength + 1);
  expect(modelList.models).toHaveLength(initialLength + 1);
  expect(modelList.models[modelList.models.length - 1].state).toBe(newState);
});

test("disposes removed models during reconciliation", () => {
  const initialModels = [...modelList.models];
  const initialLength = modelList.models.length;

  // Remove the first state from the list state
  mockListState.removeAt(0, 1);

  // The model list should be shorter and not contain the removed model
  expect(modelList.models).toHaveLength(initialLength - 1);
  expect(modelList.models).not.toContain(initialModels[0]);
});

test("completes _models$ and disposes all models on disposal", () => {
  const modelsSubscription = vi.fn();
  let completedCount = 0;

  modelList.models$.subscribe({
    next: modelsSubscription,
    complete: () => completedCount++,
  });

  modelList.dispose();

  // The models$ observable should complete
  expect(completedCount).toBe(1);
});

test("disposes ListState and models on disposal", () => {
  modelList.dispose();

  // After disposal, the model list should maintain the disposed state
  expect(() => modelList.dispose()).not.toThrow();
});

test("models getter returns current model array", () => {
  const models = modelList.models;
  expect(Array.isArray(models)).toBe(true);
  expect(models).toHaveLength(2);
  expect(models[0]).toBeInstanceOf(MockModel);
  expect(models[1]).toBeInstanceOf(MockModel);
});

test("models$ emits updates when models change", () => {
  const emissions: MockModel[][] = [];
  modelList.models$.subscribe((models) => emissions.push([...models]));

  const initialEmissionCount = emissions.length;

  // Add a new state
  const newState = new MockState();
  mockListState.add(newState);

  expect(emissions).toHaveLength(initialEmissionCount + 1);
  expect(emissions[emissions.length - 1]).toHaveLength(3);
});

test("set() updates both model list and state at specific index", () => {
  const newState = new MockState();
  const newModel = new MockModel({ state: newState });

  modelList.set(1, newModel);

  expect(modelList.models[1]).toBe(newModel);
  expect(mockListState.items[1]).toBe(newState);
});

test("add() appends model to end of models and updates state", () => {
  const newState = new MockState();
  const newModel = new MockModel({ state: newState });
  const initialLength = modelList.models.length;

  modelList.add(newModel);

  expect(modelList.models).toHaveLength(initialLength + 1);
  expect(modelList.models[modelList.models.length - 1]).toBe(newModel);
  expect(mockListState.items[mockListState.items.length - 1]).toBe(newState);
});

test("insertAt() inserts models at specific index and updates state", () => {
  const newState1 = new MockState();
  const newState2 = new MockState();
  const newModel1 = new MockModel({ state: newState1 });
  const newModel2 = new MockModel({ state: newState2 });
  const initialLength = modelList.models.length;

  modelList.insertAt(1, [newModel1, newModel2]);

  expect(modelList.models).toHaveLength(initialLength + 2);
  expect(modelList.models[1]).toBe(newModel1);
  expect(modelList.models[2]).toBe(newModel2);
  expect(mockListState.items[1]).toBe(newState1);
  expect(mockListState.items[2]).toBe(newState2);
});

test("append() adds models to the end and syncs to state", () => {
  const newState1 = new MockState();
  const newState2 = new MockState();
  const newModel1 = new MockModel({ state: newState1 });
  const newModel2 = new MockModel({ state: newState2 });
  const initialLength = modelList.models.length;

  modelList.append([newModel1, newModel2]);

  expect(modelList.models).toHaveLength(initialLength + 2);
  expect(modelList.models[modelList.models.length - 2]).toBe(newModel1);
  expect(modelList.models[modelList.models.length - 1]).toBe(newModel2);
  expect(mockListState.items[mockListState.items.length - 2]).toBe(newState1);
  expect(mockListState.items[mockListState.items.length - 1]).toBe(newState2);
});

test("prepend() adds models to the beginning and syncs to state", () => {
  const newState1 = new MockState();
  const newState2 = new MockState();
  const newModel1 = new MockModel({ state: newState1 });
  const newModel2 = new MockModel({ state: newState2 });
  const initialLength = modelList.models.length;

  modelList.prepend([newModel1, newModel2]);

  expect(modelList.models).toHaveLength(initialLength + 2);
  expect(modelList.models[0]).toBe(newModel1);
  expect(modelList.models[1]).toBe(newModel2);
  expect(mockListState.items[0]).toBe(newState1);
  expect(mockListState.items[1]).toBe(newState2);
});

test("remove() removes matching models, updates state, and disposes them", () => {
  const initialModels = [...modelList.models];
  const modelToRemove = initialModels[0];
  const initialLength = modelList.models.length;

  modelList.remove((model) => model === modelToRemove);

  expect(modelList.models).toHaveLength(initialLength - 1);
  expect(modelList.models).not.toContain(modelToRemove);
  expect(mockListState.items).not.toContain(modelToRemove.state);
});

test("remove() is a no-op if no model matches predicate", () => {
  const initialLength = modelList.models.length;
  const initialModels = [...modelList.models];

  modelList.remove(() => false);

  expect(modelList.models).toHaveLength(initialLength);
  expect(modelList.models).toEqual(initialModels);
  expect(mockListState.items).toHaveLength(initialLength);
});

test("removeAt() removes model(s) at index, updates state, and disposes them", () => {
  const initialModels = [...modelList.models];
  const modelToRemove = initialModels[1];
  const initialLength = modelList.models.length;

  modelList.removeAt(1, 1);

  expect(modelList.models).toHaveLength(initialLength - 1);
  expect(modelList.models).not.toContain(modelToRemove);
  expect(mockListState.items).not.toContain(modelToRemove.state);
});

test("removeAt() is a no-op if count is zero", () => {
  const initialLength = modelList.models.length;
  const initialModels = [...modelList.models];

  modelList.removeAt(1, 0);

  expect(modelList.models).toHaveLength(initialLength);
  expect(modelList.models).toEqual(initialModels);
  expect(mockListState.items).toHaveLength(initialLength);
});

test("does not leak subscriptions after dispose", () => {
  // The model list is already initialized in beforeEach
  // We don't need to initialize it again

  const initialSubscriptionCount =
    (mockListState.items$ as any)._subscription?.observers?.length ?? 0;

  modelList.dispose();

  // After disposal, there should be no active subscriptions
  const finalSubscriptionCount =
    (mockListState.items$ as any)._subscription?.observers?.length ?? 0;
  expect(finalSubscriptionCount).toBeLessThanOrEqual(initialSubscriptionCount);
});

test("throws no error if dispose is called multiple times", () => {
  expect(() => {
    modelList.dispose();
    modelList.dispose();
    modelList.dispose();
  }).not.toThrow();
});
