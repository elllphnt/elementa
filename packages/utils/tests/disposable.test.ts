import { assert, test } from "vitest";
import { Disposable } from "../src/index.js";

// Test that disposers run in FIFO order
test("calls disposers in order", () => {
  const calls: number[] = [];
  const d = new Disposable();
  d.addDisposer(() => calls.push(1));
  d.addDisposer(() => calls.push(2));
  d.dispose();
  assert.sameOrderedMembers(calls, [1, 2]);
});

// Test that errors are aggregated and thrown
test("aggregates errors from disposers", () => {
  const d = new Disposable();
  d.addDisposer(() => {
    throw new Error("first");
  });
  d.addDisposer(() => {
    throw new Error("second");
  });
  let thrown: any;
  try {
    d.dispose();
  } catch (err) {
    thrown = err;
  }
  assert.ok(thrown instanceof Error);
  assert.match(thrown.message, /2 errors during cleanup; first: first/);
  assert.ok(Array.isArray((thrown as any).inner));
  assert.sameOrderedMembers(
    (thrown as any).inner.map((e: any) => e.message),
    ["first", "second"]
  );
});

// Test that dispose is idempotent
test("dispose is idempotent", () => {
  let callCount = 0;
  const d = new Disposable();
  d.addDisposer(() => callCount++);
  d.dispose();
  d.dispose(); // second should do nothing
  assert.equal(callCount, 1);
});

// Test warning on addDisposer after disposal
test("warns when adding disposer after dispose", () => {
  const warnings: string[] = [];
  const orig = console.warn;
  console.warn = (msg: any) => warnings.push(String(msg));
  const d = new Disposable();
  d.dispose();
  d.addDisposer(() => {});
  console.warn = orig;
  assert.ok(warnings.length === 1);
  assert.match(warnings[0], /Adding disposer after dispose\(\)/);
});
