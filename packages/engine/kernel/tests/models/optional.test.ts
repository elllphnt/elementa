import { BehaviorSubject } from "rxjs";
import { beforeEach, expect, test, vi } from "vitest";
import { Model } from "~/models/model.js";
import { OptionalModel } from "~/models/optional_model.js";
import { State } from "~/state/state.js";
import { ValueState } from "~/state/value.js";

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

class MockValueState extends ValueState<MockState | undefined> {
  private _value$ = new BehaviorSubject<MockState | undefined>(undefined);

  constructor(initialValue?: MockState) {
    super();
    this._value$.next(initialValue);

    this.addDisposer(() => {
      this._value$.complete();
    });
  }

  get value(): MockState | undefined {
    return this._value$.value;
  }

  get value$() {
    return this._value$.asObservable();
  }

  setValue(value: MockState | undefined): void {
    this._value$.next(value);
  }
}

let mockValueState: MockValueState;
let createModelSpy: ReturnType<typeof vi.fn>;
let optionalModel: OptionalModel<MockState, MockModel>;

beforeEach(() => {
  createModelSpy = vi.fn((state: MockState, init?: boolean) => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    return new MockModel({ state });
  });
});

// 🏗️ Initialization
test("initializes with a model if state has a value", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);

  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  expect(createModelSpy).toHaveBeenCalledWith(initialState, true);
  expect(optionalModel.model).toBeInstanceOf(MockModel);
  expect(optionalModel.model?.state).toBe(initialState);
});

test("initializes with undefined model if state is undefined", () => {
  mockValueState = new MockValueState();

  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  expect(createModelSpy).not.toHaveBeenCalled();
  expect(optionalModel.model).toBeUndefined();
});

// 🔁 Reactivity & Reconciliation
test("updates model when state value changes to a new instance", () => {
  mockValueState = new MockValueState();
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });
  optionalModel.initialize();

  const newState = new MockState();
  mockValueState.setValue(newState);

  expect(createModelSpy).toHaveBeenCalledWith(newState);
  expect(optionalModel.model?.state).toBe(newState);
});

test("reuses existing model if state value does not change", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });
  optionalModel.initialize();

  const initialModel = optionalModel.model;
  createModelSpy.mockClear();

  // Set the same state value
  mockValueState.setValue(initialState);

  // Should not create a new model
  expect(createModelSpy).not.toHaveBeenCalled();
  expect(optionalModel.model).toBe(initialModel);
});

test("disposes previous model when new model is created from state", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });
  optionalModel.initialize();

  const initialModel = optionalModel.model!;
  const disposeSpy = vi.spyOn(initialModel, "dispose");

  const newState = new MockState();
  mockValueState.setValue(newState);

  expect(disposeSpy).toHaveBeenCalled();
  expect(optionalModel.model?.state).toBe(newState);
});

// 🧠 Model Access
test("model getter returns current model instance", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  const model = optionalModel.model;
  expect(model).toBeInstanceOf(MockModel);
  expect(model?.state).toBe(initialState);
});

test("model$ emits model updates reactively", () => {
  mockValueState = new MockValueState();
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });
  optionalModel.initialize();

  const emissions: (MockModel | undefined)[] = [];
  optionalModel.model$.subscribe((model) => emissions.push(model));

  const initialEmissionCount = emissions.length;

  const newState = new MockState();
  mockValueState.setValue(newState);

  expect(emissions).toHaveLength(initialEmissionCount + 1);
  expect(emissions[emissions.length - 1]?.state).toBe(newState);
});

// 🔧 set() Behavior
test("set(model) updates model and state value", () => {
  mockValueState = new MockValueState();
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  const newState = new MockState();
  const newModel = new MockModel({ state: newState });

  optionalModel.set(newModel);

  expect(optionalModel.model).toBe(newModel);
  expect(mockValueState.value).toBe(newState);
});

test("set(undefined) clears both model and state", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  optionalModel.set(undefined);

  expect(optionalModel.model).toBeUndefined();
  expect(mockValueState.value).toBeUndefined();
});

// 🧹 clear() Behavior
test("clear() disposes current model and clears state", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  const currentModel = optionalModel.model!;
  const disposeSpy = vi.spyOn(currentModel, "dispose");

  optionalModel.clear();

  expect(disposeSpy).toHaveBeenCalled();
  expect(optionalModel.model).toBeUndefined();
  expect(mockValueState.value).toBeUndefined();
});

test("clear() does nothing if model is already undefined", () => {
  mockValueState = new MockValueState();
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  // Should not throw any errors
  expect(() => optionalModel.clear()).not.toThrow();
  expect(optionalModel.model).toBeUndefined();
});

// 🧼 Lifecycle & Disposal
test("completes model$ and disposes model on lifecycle disposal", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });
  optionalModel.initialize();

  const currentModel = optionalModel.model!;
  const disposeSpy = vi.spyOn(currentModel, "dispose");
  let completedCount = 0;

  optionalModel.model$.subscribe({
    complete: () => completedCount++,
  });

  optionalModel.dispose();

  expect(disposeSpy).toHaveBeenCalled();
  expect(completedCount).toBe(1);
});

test("disposes state on lifecycle disposal", () => {
  mockValueState = new MockValueState();
  const stateDisposeSpy = vi.spyOn(mockValueState, "dispose");

  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  optionalModel.dispose();

  expect(stateDisposeSpy).toHaveBeenCalled();
});

test("does not leak subscriptions after dispose", () => {
  mockValueState = new MockValueState();
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });
  optionalModel.initialize();

  optionalModel.dispose();

  // After disposal, state changes should not affect the disposed model
  const newState = new MockState();
  mockValueState.setValue(newState);

  // The createModelSpy should not be called after disposal
  expect(createModelSpy).toHaveBeenCalledTimes(0);
});

// 🧪 Edge Cases
test("calling set() with same model reuses instance and updates state", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });

  const existingModel = optionalModel.model!;

  // Set the same model instance
  optionalModel.set(existingModel);

  expect(optionalModel.model).toBe(existingModel);
  expect(mockValueState.value).toBe(initialState);
});

test("calling set() with new model replaces and disposes old model", () => {
  const initialState = new MockState();
  mockValueState = new MockValueState(initialState);
  optionalModel = new OptionalModel({
    state: mockValueState,
    create: createModelSpy,
  });
  optionalModel.initialize();

  const oldModel = optionalModel.model!;
  const disposeSpy = vi.spyOn(oldModel, "dispose");

  const newState = new MockState();
  const newModel = new MockModel({ state: newState });

  optionalModel.set(newModel);

  expect(disposeSpy).toHaveBeenCalled();
  expect(optionalModel.model).toBe(newModel);
  expect(mockValueState.value).toBe(newState);
});
