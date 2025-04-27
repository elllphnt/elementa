import { test } from "uvu";
import * as assert from "uvu/assert";
import * as y from "yjs";
import { MapCRDTModel } from "./map";
import { CRDTModelMap } from "./model_map";

// helper to build a fresh map
function makeMap() {
  const doc = new y.Doc();
  const ymap = doc.getMap<y.Map<any>>("root");
  return new CRDTModelMap(ymap, (ym) => new MapCRDTModel(ym));
}

test("initially empty", () => {
  const m = makeMap();
  assert.equal(m.items, {});
});

test("initializes with prepopulated entries", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<y.Map<any>>("root");
  doc.transact(() => {
    const inner = new y.Map<any>([
      ["a", 1],
      ["b", 2],
    ]);
    ymap.set("one", inner);
  });
  const m = new CRDTModelMap(ymap, (ym) => new MapCRDTModel(ym));
  assert.equal(Object.keys(m.items), ["one"]);
  assert.equal(m.items.one.state, { a: 1, b: 2 });
});

test("set and retrieve model", () => {
  const m = makeMap();
  m.set("one", { a: 1 });
  const item = m.item("one");
  assert.instance(item, MapCRDTModel);
  assert.equal(item?.state, { a: 1 });
  assert.equal(Object.keys(m.items), ["one"]);
});

test("patch inner model", () => {
  const m = makeMap();
  m.set("one", { a: 1 });
  const item = m.item("one")!;
  item.patch({ b: 2 });
  assert.equal(item.state, { a: 1, b: 2 });
});

test("delete key", () => {
  const m = makeMap();
  m.set("one", { foo: true });
  m.delete("one");
  assert.not.ok(m.item("one"));
  assert.equal(m.items, {});
});

test("clear all keys", () => {
  const m = makeMap();
  m.set("a", { x: 1 });
  m.set("b", { y: 2 });
  m.clear();
  assert.equal(m.items, {});
});

test("items$ emits updates", () => {
  const m = makeMap();
  const events: Record<string, MapCRDTModel<any>>[] = [];
  m.items$.subscribe((val) => events.push(val));
  m.set("x", { v: 1 });
  m.set("y", { v: 2 });
  m.delete("x");
  assert.equal(events.length, 4);
  // initial {}
  assert.equal(events[0], {});
  // after x
  assert.equal(Object.keys(events[1]), ["x"]);
  assert.equal(events[1].x.state, { v: 1 });
  // after y
  assert.equal(Object.keys(events[2]).sort(), ["x", "y"]);
  // after delete x
  assert.equal(Object.keys(events[3]), ["y"]);
});

test("itemOf$ emits undefined then model once set", () => {
  const m = makeMap();
  const events: (MapCRDTModel<any> | undefined)[] = [];
  m.item$("key").subscribe((v) => events.push(v));
  assert.equal(events, [undefined]);
  m.set("key", { x: 5 });
  assert.instance(events[1], MapCRDTModel);
  assert.is(events[1]?.state.x, 5);
});

test("dispose completes items$ and disposes inner models", () => {
  const m = makeMap();
  let nextCount = 0;
  let completed = false;
  m.items$.subscribe(
    () => {
      nextCount++;
    },
    () => {},
    () => {
      completed = true;
    }
  );
  m.set("one", { a: 1 });
  m.dispose();
  assert.ok(completed);
  assert.is(nextCount, 2); // initial {} and after set
});

test.run();
