import { beforeEach, expect, test } from "vitest";
import * as y from "yjs";
import { CrdtValueState } from "../src/value.js";

let doc: y.Doc;
let map: y.Map<any>;
let valueState: CrdtValueState<string>;

beforeEach(() => {
  doc = new y.Doc();
  map = doc.getMap("test");
  valueState = new CrdtValueState(map, "testKey", "initial");
});

// 🏗️ Initialization
test("initializes subject with existing map value if key exists", () => {
  map.set("existingKey", "existingValue");
  const newValueState = new CrdtValueState(map, "existingKey", "fallback");
  expect(newValueState.value).toBe("existingValue");
});

test("initializes subject with provided initial value if key doesn't exist", () => {
  const newValueState = new CrdtValueState(map, "newKey", "initialValue");
  expect(newValueState.value).toBe("initialValue");
});

test("sets initial value in map if key doesn't exist", () => {
  new CrdtValueState(map, "newKey", "initialValue");
  expect(map.get("newKey")).toBe("initialValue");
});

test("registers Yjs observer on construction", () => {
  // Change value directly in map - should trigger observer
  map.set("testKey", "changed");
  expect(valueState.value).toBe("changed");
});

// 📥 Reading
test("value returns current value snapshot", () => {
  expect(valueState.value).toBe("initial");

  map.set("testKey", "updated");
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

  // Update via map directly
  map.set("testKey", "direct");
  expect(emissions).toHaveLength(3);
  expect(emissions[2]).toBe("direct");

  subscription.unsubscribe();
});

// ✏️ Mutation Methods
test("setValue() updates the value in the map", () => {
  valueState.setValue("newValue");
  expect(map.get("testKey")).toBe("newValue");
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

// 🔄 Observer Pattern
test("observer() updates subject when target property changes", () => {
  const initialValue = valueState.value;

  map.set("testKey", "changedValue");
  expect(valueState.value).toBe("changedValue");
  expect(valueState.value).not.toBe(initialValue);
});

test("observer() ignores changes to other properties", () => {
  const initialValue = valueState.value;

  map.set("otherKey", "otherValue");
  expect(valueState.value).toBe(initialValue);
});

// 🧼 Disposal
test("dispose() unsubscribes from Yjs map changes", () => {
  valueState.dispose();

  // After disposal, changes to map should not affect the value state
  const valueBefore = valueState.value;
  map.set("testKey", "shouldNotUpdate");
  expect(valueState.value).toBe(valueBefore);
});

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
