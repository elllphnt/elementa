import { test } from "uvu";
import * as assert from "uvu/assert";
import * as y from "yjs";
import { CRDTModel } from "./model";
import { CRDTModelList } from "./model_list";

class DummyModel extends CRDTModel<any> {
  constructor(public ymap: y.Map<any>) {
    super(ymap);
  }
}

function createList() {
  const doc = new y.Doc();
  const yarray = doc.getArray<y.Map<any>>("test");
  return new CRDTModelList<DummyModel>(yarray, (ymap) => new DummyModel(ymap));
}

test("add items", () => {
  const list = createList();
  const maps = list.add({ foo: 1 }, { foo: 2 });
  assert.is(list.items.length, 2);
  assert.is(list.items[0].ymap.get("foo"), 1);
  assert.is(list.items[1].ymap.get("foo"), 2);
  assert.is(maps[0].get("foo"), 1);
  assert.is(maps[1].get("foo"), 2);
});

test("insertAt items", () => {
  const list = createList();
  list.add({ foo: 1 }, { foo: 3 });
  const maps = list.insertAt(1, { foo: 2 });
  assert.is(list.items.length, 3);
  assert.is(maps[0].get("foo"), 2);
  assert.is(list.items.map((m) => m.ymap.get("foo")).join(","), "1,2,3");
});

test("removeAt removes items", () => {
  const list = createList();
  list.add({ foo: 1 }, { foo: 2 }, { foo: 3 });
  list.removeAt(1, 1);
  assert.is(list.items.map((m) => m.ymap.get("foo")).join(","), "1,3");
});

test("clear removes all items", () => {
  const list = createList();
  list.add({ foo: 1 });
  list.clear();
  assert.is(list.items.length, 0);
});

test("transact groups changes", () => {
  const list = createList();
  list.transact(() => {
    list.add({ foo: "a" });
    list.add({ foo: "b" });
  });
  assert.is(list.items.length, 2);
});

test("add with no args returns empty array and leaves items unchanged", () => {
  const list = createList();
  const maps = list.add();
  assert.equal(maps, []);
  assert.is(list.items.length, 0);
});

test("insertAt with no args returns empty array and leaves items unchanged", () => {
  const list = createList();
  list.add({ foo: 1 });
  const maps = list.insertAt(0);
  assert.equal(maps, []);
  assert.is(list.items.length, 1);
});

test("itemOf returns the correct model", () => {
  const list = createList();
  const [map] = list.add({ foo: 42 });
  const model = list.itemOf(map);
  assert.ok(model);
  assert.is(model?.ymap.get("foo"), 42);
});

test("items$ emits initial empty array", () => {
  const list = createList();
  const events: any[] = [];
  list.items$.subscribe((v) => events.push(v));
  assert.equal(events, [[]]);
});

test("dispose completes items$ and disposes models", () => {
  const list = createList();
  let nextCount = 0;
  let completed = false;
  list.items$.subscribe(
    () => {
      nextCount++;
    },
    () => {},
    () => {
      completed = true;
    },
  );
  list.add({ foo: 1 });
  list.dispose();
  assert.ok(completed);
  assert.is(nextCount, 2); // initial [] and after add
});

test("initializes with prepopulated array entries", () => {
  const doc = new y.Doc();
  const yarray = doc.getArray<y.Map<any>>("test");
  const maps = [new y.Map<any>([["foo", 3]]), new y.Map<any>([["bar", 4]])];
  doc.transact(() => {
    yarray.push(maps);
  });
  const list = new CRDTModelList<DummyModel>(
    yarray,
    (ymap) => new DummyModel(ymap),
  );
  assert.is(list.items.length, 2);
  assert.is(list.items[0].ymap.get("foo"), 3);
  assert.is(list.items[1].ymap.get("bar"), 4);
});

test.run();
