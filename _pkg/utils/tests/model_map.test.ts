import { test } from "uvu";
import * as assert from "uvu/assert";
import * as y from "yjs";
import { withCRDTModelMapBehavior as createModelMap } from "../src/crdt/model_map";
import { Extendable } from "../src/types/extendable";

function withDummy(ytype: Extendable<y.AbstractType<any>>) {
  ytype.dispose = () => {};
  return ytype as y.Map<any> & { dispose(): void };
}

// helper to build a fresh map
function makeMap() {
  const doc = new y.Doc();
  const ymap = doc.getMap<y.Map<any>>("root");
  return createModelMap(ymap as any, withDummy);
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
  const m = createModelMap(ymap as any, withDummy);
  assert.equal(Object.keys(m.items), ["one"]);
  assert.equal(m.items.one.toJSON(), { a: 1, b: 2 });
});

test("set and retrieve model", () => {
  const m = makeMap();
  const model = withDummy(new y.Map<any>());
  m.set("one", model);
  const item = m.get("one");
  assert.equal(item?.toJSON(), { a: 1 });
  assert.equal(Object.keys(m.items), ["one"]);
});

test("patch inner model", () => {
  const m = makeMap();
  const model = withDummy(new y.Map<any>([["a", 1]]));
  m.set("one", model);
  const item = m.get("one")!;
  item.set("b", 2);
  assert.equal(item.toJSON(), { a: 1, b: 2 });
});

test("delete key", () => {
  const m = makeMap();
  const model = withDummy(new y.Map<any>([["a", 1]]));
  m.set("one", model);
  assert.equal(Object.keys(m.items), ["one"]);
  m.delete("one");
  assert.equal(Object.keys(m.items), []);
  assert.equal(m.get("one"), undefined);
});

test("items$ emits updates", () => {
  const m = makeMap();
  const events: Record<string, any>[] = [];
  m.items$.subscribe((val) => events.push(val));
  m.set("x", withDummy(new y.Map<any>([["v", 1]])));
  m.set("y", withDummy(new y.Map<any>([["v", 2]])));
  m.delete("x");
  assert.equal(events.length, 4);
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
  m.set("one", withDummy(new y.Map<any>([["a", 1]])));
  m.dispose();
  assert.ok(completed);
  assert.is(nextCount, 2); // initial {} and after set
});
