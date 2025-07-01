import { beforeEach, expect, test } from "vitest";
import { jsonBackend } from "../src/backend.js";
import { JsonListState } from "../src/list.js";

let listState: JsonListState<string>;

beforeEach(() => {
  listState = new JsonListState({ init: [], backend: jsonBackend });
  listState.initialize();
});

// 🏗️ Initialization
test("initializes subject with provided initial value", () => {
  const initialData = ["a", "b", "c"];
  const newListState = new JsonListState({
    init: initialData,
    backend: jsonBackend,
  });
  newListState.initialize();
  expect(newListState.items).toEqual(["a", "b", "c"]);
});

test("initializes subject with empty list if no initial value provided", () => {
  expect(listState.items).toEqual([]);
});

// 📥 Reading
test("items returns current list snapshot", () => {
  listState.append(["a", "b", "c"]);
  expect(listState.items).toEqual(["a", "b", "c"]);
});

test("items$ emits updated list when list changes", async () => {
  const emissions: string[][] = [];
  const subscription = listState.items$.subscribe((items) =>
    emissions.push([...items])
  );

  // Initial emission
  expect(emissions).toHaveLength(1);
  expect(emissions[0]).toEqual([]);

  // Add items
  listState.add("a");
  expect(emissions).toHaveLength(2);
  expect(emissions[1]).toEqual(["a"]);

  listState.append(["b", "c"]);
  expect(emissions).toHaveLength(3);
  expect(emissions[2]).toEqual(["a", "b", "c"]);

  subscription.unsubscribe();
});

// ➕ Mutation Methods
test("add() pushes a single item to the end", () => {
  listState.add("first");
  listState.add("second");
  expect(listState.items).toEqual(["first", "second"]);
});

test("append() pushes multiple items to the end", () => {
  listState.add("first");
  listState.append(["second", "third"]);
  expect(listState.items).toEqual(["first", "second", "third"]);
});

test("prepend() inserts items at the beginning", () => {
  listState.add("middle");
  listState.prepend(["first", "second"]);
  expect(listState.items).toEqual(["first", "second", "middle"]);
});

test("insertAt() inserts items at specified index", () => {
  listState.append(["a", "c"]);
  listState.insertAt(1, ["b"]);
  expect(listState.items).toEqual(["a", "b", "c"]);

  listState.insertAt(0, ["start"]);
  expect(listState.items).toEqual(["start", "a", "b", "c"]);
});

// ❌ Removal
test("remove() deletes items matching predicate and returns them", () => {
  listState.append(["a", "b", "c", "b", "d"]);

  const removed = listState.remove((item) => item === "b");
  expect(removed).toEqual(["b", "b"]);
  expect(listState.items).toEqual(["a", "c", "d"]);
});

test("remove() does nothing if no item matches predicate", () => {
  listState.append(["a", "b", "c"]);

  const removed = listState.remove((item) => item === "x");
  expect(removed).toEqual([]);
  expect(listState.items).toEqual(["a", "b", "c"]);
});

test("removeAt() deletes item(s) at index and returns them", () => {
  listState.append(["a", "b", "c", "d"]);

  const removed = listState.removeAt(1, 2);
  expect(removed).toEqual(["b", "c"]);
  expect(listState.items).toEqual(["a", "d"]);
});

test("removeAt() deletes nothing if count is zero", () => {
  listState.append(["a", "b", "c"]);

  const removed = listState.removeAt(1, 0);
  expect(removed).toEqual([]);
  expect(listState.items).toEqual(["a", "b", "c"]);
});

// 🔁 Replace & Clear
test("setItems() replaces all items in the list", () => {
  listState.append(["a", "b"]);
  listState.setItems(["x", "y", "z"]);
  expect(listState.items).toEqual(["x", "y", "z"]);
});

test("clear() removes all items and returns previous values", () => {
  listState.append(["a", "b", "c"]);

  const removed = listState.clear();
  expect(removed).toEqual(["a", "b", "c"]);
  expect(listState.items).toEqual([]);
});

// 🧼 Disposal
test("dispose() completes the BehaviorSubject", () => {
  let completed = false;
  listState.items$.subscribe({
    complete: () => {
      completed = true;
    },
  });

  listState.dispose();
  expect(completed).toBe(true);
});

test("dispose() can be called multiple times without error", () => {
  expect(() => {
    listState.dispose();
    listState.dispose();
    listState.dispose();
  }).not.toThrow();
});
