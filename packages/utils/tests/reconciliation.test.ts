import { test } from "uvu";
import * as assert from "uvu/assert";
import { reconcileList } from "../src/core/reconciliation";

test("returns empty when both targets and sources are empty", () => {
  const result = reconcileList({
    targets: [],
    sources: [],
    sourceRef: (s: number) => s,
    targetRef: (t: number) => t,
    create: (s) => s,
    reconcile: (_t, _s) => {},
  });
  assert.equal(result, []);
});

test("creates new targets when no existing targets", () => {
  const sources = [1, 2, 3];
  const result = reconcileList({
    targets: [] as number[],
    sources,
    sourceRef: (s) => s,
    targetRef: (t) => t,
    create: (s) => s * 10,
    reconcile: (_t, _s) => {},
  });
  assert.equal(result, [10, 20, 30]);
});

test("reuses matching targets and disposes leftovers", () => {
  const targets = [{ id: 1 }, { id: 2 }, { id: 99 }];
  const sources = [{ id: 2 }, { id: 1 }, { id: 3 }];
  const disposed: number[] = [];
  const result = reconcileList({
    targets,
    sources,
    sourceRef: (s) => s.id,
    targetRef: (t) => t.id,
    create: (s) => ({ id: s.id }),
    reconcile: (_t, _s) => {},
    dispose: (t) => disposed.push(t.id),
  });
  // reused id=2 then id=1, created id=3
  assert.equal(
    result.map((t) => t.id),
    [2, 1, 3]
  );
  // only id=99 should be disposed
  assert.equal(disposed, [99]);
});

test("preserves order according to sources", () => {
  const targets = [{ key: "a" }, { key: "b" }];
  const sources = [{ key: "b" }, { key: "a" }];
  const result = reconcileList({
    targets,
    sources,
    sourceRef: (s) => s.key,
    targetRef: (t) => t.key,
    create: (s) => ({ key: s.key }),
    reconcile: (_t, _s) => {},
  });
  assert.is(result[0], targets[1]);
  assert.is(result[1], targets[0]);
});

test.run();
