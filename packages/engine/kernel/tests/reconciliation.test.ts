import { assert, test } from "vitest";
import { reconcileList } from "~/reconciliation.js";

test("returns empty when both targets and sources are empty", () => {
  const [result] = reconcileList({
    targets: [],
    sources: [],
    sourceRef: (s: number) => s,
    targetRef: (t: number) => t,
    create: (s) => s,
    reconcile: () => {},
  });
  assert.sameOrderedMembers(result, []);
});

test("creates new targets when no existing targets", () => {
  const sources = [1, 2, 3];
  const [result] = reconcileList({
    targets: [] as number[],
    sources,
    sourceRef: (s) => s,
    targetRef: (t) => t,
    create: (s) => s * 10,
    reconcile: () => {},
  });
  assert.sameOrderedMembers(result, [10, 20, 30]);
});

test("preserves order according to sources", () => {
  const targets = [{ key: "a" }, { key: "b" }];
  const sources = [{ key: "b" }, { key: "a" }];
  const [result] = reconcileList({
    targets,
    sources,
    sourceRef: (s) => s.key,
    targetRef: (t) => t.key,
    create: (s) => ({ key: s.key }),
    reconcile: () => {},
  });
  assert.equal(result[0], targets[1]);
  assert.equal(result[1], targets[0]);
});
