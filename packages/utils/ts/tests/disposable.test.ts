import { assert, test } from "vitest";
import { Lifecycle } from "../src/index.js";

// Create a concrete implementation for testing
class TestLifecycle extends Lifecycle {}

// Test that disposers run in FIFO order
test("calls disposers in order", () => {
  const calls: number[] = [];
  const d = new TestLifecycle();
  d.initialize();
  d.addDisposer(() => calls.push(1));
  d.addDisposer(() => calls.push(2));
  d.dispose();
  assert.sameOrderedMembers(calls, [1, 2]);
});

// Test that errors are aggregated and thrown
test("aggregates errors from disposers", () => {
  const d = new TestLifecycle();
  d.initialize();
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
  const d = new TestLifecycle();
  d.initialize();
  d.addDisposer(() => callCount++);
  d.dispose();
  d.dispose(); // second should do nothing
  assert.equal(callCount, 1);
});

// Test error when adding disposer after disposal
test("throws error when adding disposer after dispose", () => {
  const d = new TestLifecycle();
  d.initialize();
  d.dispose();
  assert.throws(() => {
    d.addDisposer(() => {});
  }, /Cannot add disposer to a disposed Lifecycle instance/);
});

// Test that lifecycle can add disposers before initialization
test("allows adding disposers before initialization", () => {
  const d = new TestLifecycle();
  // This should not throw
  d.addDisposer(() => {});
  d.initialize();
  d.dispose();
});

// Test that initializers cannot be added after initialization
test("throws error when adding initializer after initialization", () => {
  const d = new TestLifecycle();
  d.initialize();
  assert.throws(() => {
    d.addInitializer(() => {});
  }, /Cannot add initializer to an already initialized Lifecycle instance/);
});

// Test that initializers run in reverse order (LIFO)
test("calls initializers in reverse order", () => {
  const calls: number[] = [];
  const d = new TestLifecycle();
  d.addInitializer(() => calls.push(1));
  d.addInitializer(() => calls.push(2));
  d.initialize();
  assert.sameOrderedMembers(calls, [2, 1]);
});

// Test that initialization can only happen once
test("initialize is idempotent", () => {
  const d = new TestLifecycle();
  d.initialize();
  assert.throws(() => {
    d.initialize();
  }, /Lifecycle instance is already initialized/);
});

// Test lifecycle state properties
test("tracks initialized and disposed state", () => {
  const d = new TestLifecycle();
  assert.equal(d.initialized, false);
  assert.equal(d.disposed, false);

  d.initialize();
  assert.equal(d.initialized, true);
  assert.equal(d.disposed, false);

  d.dispose();
  assert.equal(d.initialized, true);
  assert.equal(d.disposed, true);
});

// Test that initializers are cleared after initialization
test("clears initializers after initialization", () => {
  let callCount = 0;
  const d = new TestLifecycle();
  d.addInitializer(() => callCount++);
  d.initialize();

  // Initializers should be cleared, so there should be no side effects
  // if we were to call them again (which we can't since initialize throws)
  assert.equal(callCount, 1);

  // Try to add another initializer after initialization - should throw
  assert.throws(() => {
    d.addInitializer(() => callCount++);
  }, /Cannot add initializer to an already initialized Lifecycle instance/);

  // Count should still be 1
  assert.equal(callCount, 1);
});

// Test error message format includes class name
test("error message includes class name", () => {
  const d = new TestLifecycle();
  d.initialize();
  d.addDisposer(() => {
    throw new Error("test error");
  });
  let thrown: any;
  try {
    d.dispose();
  } catch (err) {
    thrown = err;
  }
  assert.match(thrown.message, /TestLifecycle dispose\(\) failed/);
});
