import { beforeEach, expect, test } from "vitest";
import { JsonRecordState } from "../src/record.js";

interface TestRecord extends Record<string, unknown> {
  name: string;
  age: number;
  active?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
}

let recordState: JsonRecordState<TestRecord>;

beforeEach(() => {
  recordState = new JsonRecordState<TestRecord>({
    name: "",
    age: 0,
  });
});

// 🏗️ Initialization
test("initializes subject with provided initial value", () => {
  const initialData: TestRecord = {
    name: "John",
    age: 30,
    active: true,
  };
  const newRecordState = new JsonRecordState(initialData);
  expect(newRecordState.record).toEqual(initialData);
});

test("initializes subject with empty record if minimal data provided", () => {
  const minimalState = new JsonRecordState({ name: "", age: 0 });
  expect(minimalState.record).toEqual({ name: "", age: 0 });
});

// 📥 Reading
test("record returns current record snapshot", () => {
  recordState.set("name", "John");
  recordState.set("age", 30);
  expect(recordState.record).toEqual({ name: "John", age: 30 });
});

test("record$ emits updated record when record changes", async () => {
  const emissions: TestRecord[] = [];
  const subscription = recordState.record$.subscribe((record) =>
    emissions.push({ ...record })
  );

  // Initial emission
  expect(emissions).toHaveLength(1);
  expect(emissions[0]).toEqual({ name: "", age: 0 });

  // Update entries
  recordState.set("name", "John");
  expect(emissions).toHaveLength(2);
  expect(emissions[1]).toEqual({ name: "John", age: 0 });

  recordState.set("age", 30);
  expect(emissions).toHaveLength(3);
  expect(emissions[2]).toEqual({ name: "John", age: 30 });

  subscription.unsubscribe();
});

test("entry() returns value for specified key", () => {
  recordState.set("name", "John");
  recordState.set("age", 30);

  expect(recordState.entry("name")).toBe("John");
  expect(recordState.entry("age")).toBe(30);
  expect(recordState.entry("active")).toBeUndefined();
});

test("entry$() emits value changes for specified key", async () => {
  const nameEmissions: string[] = [];
  const subscription = recordState.entry$("name").subscribe((name) => {
    if (name !== "") nameEmissions.push(name);
  });

  recordState.set("name", "John");
  recordState.set("name", "Jane");
  recordState.set("age", 30); // Should not affect name emissions

  expect(nameEmissions).toEqual(["John", "Jane"]);
  subscription.unsubscribe();
});

// ✏️ Mutation Methods
test("set() updates value for specified key", () => {
  recordState.set("name", "John");
  expect(recordState.record.name).toBe("John");

  recordState.set("age", 30);
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
  // Note: In JSON backend, the nested state is independent
  expect(nestedState.record).toEqual({ key: "value" });
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
  expect(listState.items).toEqual(["tag1", "tag2"]);
});

test("getListState() throws error if state already exists for key", () => {
  recordState.getListState("tags");

  expect(() => {
    recordState.getListState("tags");
  }).toThrow('List state for key "tags" already exists.');
});

test("getAggregatedStateRecord() creates aggregated record state", () => {
  const aggregatedState = recordState.getAggregatedStateRecord("metadata");
  expect(aggregatedState).toBeDefined();
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
  expect(valueState.value).toBe("Updated");
});

test("getValueState() throws error if state already exists for key", () => {
  recordState.getValueState("name");

  expect(() => {
    recordState.getValueState("name");
  }).toThrow('Value state for key "name" already exists.');
});

// 🧼 Disposal
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
