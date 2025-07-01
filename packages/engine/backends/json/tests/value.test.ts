import { beforeEach, expect, test } from "vitest";
import { jsonBackend } from "../src/backend.js";
import { JsonValueState } from "../src/value.js";

let valueState: JsonValueState<string>;

beforeEach(() => {
  valueState = new JsonValueState({ init: "initial", backend: jsonBackend });
  valueState.initialize();
});

// 🏗️ Initialization
test("initializes subject with provided initial value", () => {
  const newValueState = new JsonValueState({
    init: "testValue",
    backend: jsonBackend,
  });
  newValueState.initialize();
  expect(newValueState.value).toBe("testValue");
});

test("initializes subject with different types", () => {
  const numberState = new JsonValueState({ init: 42, backend: jsonBackend });
  numberState.initialize();
  expect(numberState.value).toBe(42);

  const objectState = new JsonValueState({
    init: { key: "value" },
    backend: jsonBackend,
  });
  objectState.initialize();
  expect(objectState.value).toEqual({ key: "value" });

  const arrayState = new JsonValueState({
    init: [1, 2, 3],
    backend: jsonBackend,
  });
  arrayState.initialize();
  expect(arrayState.value).toEqual([1, 2, 3]);
});

// 📥 Reading
test("value returns current value snapshot", () => {
  expect(valueState.value).toBe("initial");

  valueState.setValue("updated");
  expect(valueState.value).toBe("updated");
});

test("value$ emits updated value when property changes", async () => {
  const emissions: string[] = [];
  const subscription = valueState.value$.subscribe((value) =>
    emissions.push(value)
  );

  // Initial emission
  expect(emissions).toHaveLength(1);
  expect(emissions[0]).toBe("initial");

  // Update value
  valueState.setValue("changed");
  expect(emissions).toHaveLength(2);
  expect(emissions[1]).toBe("changed");

  valueState.setValue("final");
  expect(emissions).toHaveLength(3);
  expect(emissions[2]).toBe("final");

  subscription.unsubscribe();
});

// ✏️ Mutation Methods
test("setValue() updates the value", () => {
  valueState.setValue("newValue");
  expect(valueState.value).toBe("newValue");
});

test("setValue() triggers subject emission", () => {
  const emissions: string[] = [];
  const subscription = valueState.value$.subscribe((value) =>
    emissions.push(value)
  );

  valueState.setValue("updated");
  expect(emissions[emissions.length - 1]).toBe("updated");

  subscription.unsubscribe();
});

test("setValue() works with different types", () => {
  const numberState = new JsonValueState({ init: 0, backend: jsonBackend });
  numberState.initialize();
  numberState.setValue(100);
  expect(numberState.value).toBe(100);

  const objectState = new JsonValueState({
    init: { initial: true },
    backend: jsonBackend,
  });
  objectState.initialize();
  objectState.setValue({ initial: false });
  expect(objectState.value).toEqual({ initial: false });
});

// 🧼 Disposal
test("dispose() completes the BehaviorSubject", () => {
  let completed = false;
  valueState.value$.subscribe({
    complete: () => {
      completed = true;
    },
  });

  valueState.dispose();
  expect(completed).toBe(true);
});

test("dispose() can be called multiple times without error", () => {
  expect(() => {
    valueState.dispose();
    valueState.dispose();
    valueState.dispose();
  }).not.toThrow();
});

test("value remains accessible after disposal", () => {
  const lastValue = "final";
  valueState.setValue(lastValue);
  valueState.dispose();

  // Value should still be accessible after disposal
  expect(valueState.value).toBe(lastValue);
});
