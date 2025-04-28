import { test } from "uvu";
import * as assert from "uvu/assert";
import * as y from "yjs";
import { attachReactiveMap as createMapModel } from "../src/crdt/map";

// helper to create a MapCRDTModel with initial entries
function createModel(initial: Record<string, any> = {}) {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("test");
  doc.transact(() => {
    for (const [k, v] of Object.entries(initial)) {
      ymap.set(k, v);
    }
  });
  return createMapModel<typeof initial>(ymap);
}

test("initializes with map entries", () => {
  const model = createModel({ a: 1, b: "two" });
  assert.equal(model.value, { a: 1, b: "two" });
});

test("initializes empty when no initial entries", () => {
  const model = createModel();
  assert.equal(model.value, {});
});

test("patch updates values", () => {
  const model = createModel({ a: 1 });
  model.patch({ b: 2 });
  assert.is(model.value.a, 1);
  assert.is(model.value.b, 2);
});

test("set replaces entries and removes missing keys", () => {
  const model = createModel({ a: 1, b: 2 });
  model.patch({ a: 10, c: 3 });
  assert.ok(!("b" in model.value));
  assert.equal(model.value, { a: 10, c: 3 });
});

test("dispose unsubscribes observer and completes value$", () => {
  const model = createModel({ a: 1 });
  let nextCount = 0;
  let completed = false;
  model.observable$.subscribe(
    () => {
      nextCount++;
    },
    () => {},
    () => {
      completed = true;
    }
  );
  model.dispose();
  model.patch({ b: 2 }); // should not emit
  assert.ok(completed);
  assert.is(nextCount, 1); // only the initial emission
});
