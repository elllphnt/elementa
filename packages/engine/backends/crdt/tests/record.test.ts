import { beforeEach, expect, test } from "vitest";
import * as y from "yjs";
import { CrdtRecordState } from "../src/record.js";

interface TestRecord extends Record<string, unknown> {
  name: string;
  age: number;
  active?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
}

let doc: y.Doc;
let map: y.Map<any>;
let recordState: CrdtRecordState<TestRecord>;

beforeEach(() => {
  doc = new y.Doc();
  map = doc.getMap<any>("test");
  recordState = new CrdtRecordState<TestRecord>(map);
  recordState.initialize();
});

// 🏗️ Initialization
test("initializes subject with current map entries if doc is attached", () => {
  map.set("name", "John");
  map.set("age", 30);

  const newRecordState = new CrdtRecordState<TestRecord>(map);
  newRecordState.initialize();
  expect(newRecordState.record).toEqual({ name: "John", age: 30 });
});

test("initializes subject with empty record if doc is not attached", () => {
  const unattachedMap = new y.Map<any>();
  const newRecordState = new CrdtRecordState<TestRecord>(unattachedMap);
  newRecordState.initialize();
  expect(newRecordState.record).toEqual({});
});

test("registers Yjs observer on construction", () => {
  map.set("name", "Initial");

  const newRecordState = new CrdtRecordState<TestRecord>(map);
  newRecordState.initialize();

  // Change value directly in map - should trigger observer
  map.set("name", "Changed");
  expect(newRecordState.record.name).toBe("Changed");
});

// 📥 Reading
test("record returns current record snapshot", () => {
  map.set("name", "John");
  map.set("age", 30);
  expect(recordState.record).toEqual({ name: "John", age: 30 });
});

test("record$ emits updated record when map changes", async () => {
  const emissions: TestRecord[] = [];
  const subscription = recordState.record$.subscribe((record) =>
    emissions.push({ ...record })
  );

  // Initial emission
  expect(emissions).toHaveLength(1);
  expect(emissions[0]).toEqual({});

  // Add entries
  recordState.set("name", "John");
  expect(emissions).toHaveLength(2);
  expect(emissions[1]).toEqual({ name: "John" });

  recordState.set("age", 30);
  expect(emissions).toHaveLength(3);
  expect(emissions[2]).toEqual({ name: "John", age: 30 });

  subscription.unsubscribe();
});

test("entry() returns value for specified key", () => {
  map.set("name", "John");
  map.set("age", 30);

  expect(recordState.entry("name")).toBe("John");
  expect(recordState.entry("age")).toBe(30);
  expect(recordState.entry("active")).toBeUndefined();
});

test("entry$() emits value changes for specified key", async () => {
  const nameEmissions: string[] = [];

  // Start subscribing before setting any values
  const subscription = recordState.entry$("name").subscribe((name) => {
    if (name !== undefined) nameEmissions.push(name);
  });

  recordState.set("name", "John");
  recordState.set("name", "Jane");
  // Note: Setting age will trigger the record$ to emit, which causes entry$ to emit "Jane" again
  recordState.set("age", 30); // This will cause another emission of the current "name" value

  expect(nameEmissions).toEqual(["John", "Jane", "Jane"]);
  subscription.unsubscribe();
});

// ✏️ Mutation Methods
test("set() updates value for specified key", () => {
  recordState.set("name", "John");
  expect(map.get("name")).toBe("John");
  expect(recordState.record.name).toBe("John");

  recordState.set("age", 30);
  expect(map.get("age")).toBe(30);
  expect(recordState.record.age).toBe(30);
});

test("setAll() updates multiple key-value pairs", () => {
  recordState.setAll({
    name: "John",
    age: 30,
    active: true,
  });

  expect(recordState.record).toEqual({
    name: "John",
    age: 30,
    active: true,
  });
});

test("setRecord() replaces entire record", () => {
  recordState.set("name", "Old");
  recordState.set("age", 25);

  recordState.setRecord({
    name: "New",
    age: 35,
    active: true,
  });

  expect(recordState.record).toEqual({
    name: "New",
    age: 35,
    active: true,
  });
});

// ❌ Removal
test("remove() deletes entry for specified key and returns value", () => {
  recordState.set("name", "John");
  recordState.set("age", 30);

  const removedValue = recordState.remove("name");
  expect(removedValue).toBe("John");
  expect(recordState.record).toEqual({ age: 30 });
  expect(map.has("name")).toBe(false);
});

test("removeAll() deletes multiple entries by keys", () => {
  recordState.setAll({
    name: "John",
    age: 30,
    active: true,
  });

  recordState.removeAll(["name", "active"]);
  expect(recordState.record).toEqual({ age: 30 });
});

// 🏗️ Sub-state Creation
test("getRecordState() creates nested record state for object properties", () => {
  const nestedState = recordState.getRecordState("metadata");
  expect(nestedState).toBeDefined();

  nestedState.set("key", "value");
  // Check that the underlying Yjs map has the value
  const metadataMap = map.get("metadata") as y.Map<any>;
  expect(metadataMap.get("key")).toBe("value");
});

test("getRecordState() throws error if state already exists for key", () => {
  recordState.getRecordState("metadata");

  expect(() => {
    recordState.getRecordState("metadata");
  }).toThrow('Record state for key "metadata" already exists.');
});

test("getListState() creates nested list state for array properties", () => {
  const listState = recordState.getListState("tags");
  expect(listState).toBeDefined();

  listState.add("tag1");
  listState.add("tag2");
  // Check that the underlying Yjs array has the values
  const tagsArray = map.get("tags") as y.Array<string>;
  expect(tagsArray.toArray()).toEqual(["tag1", "tag2"]);
});

test("getListState() throws error if state already exists for key", () => {
  recordState.getListState("tags");

  expect(() => {
    recordState.getListState("tags");
  }).toThrow('List state for key "tags" already exists.');
});

test.skip("getAggregatedStateRecord() creates aggregated record state", () => {
  const aggregatedState = recordState.getAggregatedStateRecord("metadata");
  expect(aggregatedState).toBeDefined();

  const nestedRecord = aggregatedState.entry("nested", true);
  nestedRecord.set("key", "value");
  expect(recordState.record.metadata).toBeDefined();
});

test("getAggregatedStateRecord() throws error if state already exists for key", () => {
  recordState.getAggregatedStateRecord("metadata");

  expect(() => {
    recordState.getAggregatedStateRecord("metadata");
  }).toThrow('Aggregated state for key "metadata" already exists.');
});

test("getAggregatedStateList() creates aggregated list state", () => {
  const aggregatedList = recordState.getAggregatedStateList("tags");
  expect(aggregatedList).toBeDefined();
});

test("getAggregatedStateList() throws error if state already exists for key", () => {
  recordState.getAggregatedStateList("tags");

  expect(() => {
    recordState.getAggregatedStateList("tags");
  }).toThrow('Aggregated state for key "tags" already exists.');
});

test("getValueState() creates value state for primitive properties", () => {
  recordState.set("name", "Initial");

  const valueState = recordState.getValueState("name");
  expect(valueState).toBeDefined();
  expect(valueState.value).toBe("Initial");

  valueState.setValue("Updated");
  expect(recordState.record.name).toBe("Updated");
});

test("getValueState() throws error if state already exists for key", () => {
  recordState.getValueState("name");

  expect(() => {
    recordState.getValueState("name");
  }).toThrow('Value state for key "name" already exists.');
});

// 🔄 Observer Pattern
test("observer() updates subject when map entries change", () => {
  // Direct modification to Yjs map should trigger observer
  map.set("name", "Direct");
  expect(recordState.record.name).toBe("Direct");
});

test("observer() handles add/update actions correctly", () => {
  map.set("name", "John");
  expect(recordState.record.name).toBe("John");

  map.set("name", "Jane");
  expect(recordState.record.name).toBe("Jane");
});

test("observer() handles delete actions correctly", () => {
  map.set("name", "John");
  map.set("age", 30);
  expect(recordState.record).toEqual({ name: "John", age: 30 });

  map.delete("name");
  expect(recordState.record).toEqual({ age: 30 });
});

// 🧼 Disposal
test("dispose() unsubscribes from Yjs map changes", () => {
  recordState.dispose();

  // After disposal, changes to map should not affect the record state
  const recordBefore = { ...recordState.record };
  map.set("name", "shouldNotUpdate");
  expect(recordState.record).toEqual(recordBefore);
});

test("dispose() completes the BehaviorSubject", () => {
  let completed = false;
  recordState.record$.subscribe({
    complete: () => {
      completed = true;
    },
  });

  recordState.dispose();
  expect(completed).toBe(true);
});

test("dispose() disposes all sub-states", () => {
  const valueState = recordState.getValueState("name");
  const listState = recordState.getListState("tags");

  let valueCompleted = false;
  let listCompleted = false;

  valueState.value$.subscribe({
    complete: () => {
      valueCompleted = true;
    },
  });

  listState.items$.subscribe({
    complete: () => {
      listCompleted = true;
    },
  });

  recordState.dispose();

  expect(valueCompleted).toBe(true);
  expect(listCompleted).toBe(true);
});

test("dispose() can be called multiple times without error", () => {
  expect(() => {
    recordState.dispose();
    recordState.dispose();
    recordState.dispose();
  }).not.toThrow();
});
