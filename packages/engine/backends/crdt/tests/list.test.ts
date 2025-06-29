import { beforeEach, expect, test } from "vitest";
import * as y from "yjs";
import { CrdtListState } from "../src/list.js";

let doc: y.Doc;
let array: y.Array<string>;
let listState: CrdtListState<string>;

beforeEach(() => {
  doc = new y.Doc();
  array = doc.getArray<string>("test");
  listState = new CrdtListState(array);
});

// 🏗️ Initialization
test("initializes subject with current list value if doc is attached", () => {
  array.push(["a", "b", "c"]);
  const newListState = new CrdtListState(array);
  expect(newListState.items).toEqual(["a", "b", "c"]);
});

test("initializes subject with empty list if doc is not attached", () => {
  const unattachedArray = new y.Array<string>();
  const newListState = new CrdtListState(unattachedArray);
  expect(newListState.items).toEqual([]);
});

test("registers Yjs observer on construction", () => {
  array.push(["initial"]);
  const newListState = new CrdtListState(array);

  // Add item directly to Yjs array - should trigger observer
  array.push(["added"]);
  expect(newListState.items).toEqual(["initial", "added"]);
});

// 📥 Reading
test("items returns current list snapshot", () => {
  array.push(["a", "b", "c"]);
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
test("dispose() unsubscribes from Yjs list changes", () => {
  listState.dispose();

  // After disposal, changes to Yjs array should not affect the list state
  const itemsBefore = [...listState.items];
  array.push(["new"]);
  expect(listState.items).toEqual(itemsBefore);
});

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
