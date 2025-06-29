import { beforeEach, expect, test, vi } from "vitest";
import { Lifecycle } from "~/index.js";

// Test implementation of abstract Lifecycle class
class TestLifecycle extends Lifecycle {
  onInitializedCalled = false;
  onDisposedCalled = false;

  protected onInitialized() {
    this.onInitializedCalled = true;
  }

  protected onDisposed() {
    this.onDisposedCalled = true;
  }
}

beforeEach(() => {
  // Reset static state before each test
  Lifecycle.track = false;
  Lifecycle.logger = undefined;
  Lifecycle.instances.clear();
});

test("constructs with a unique key from keyManager", () => {
  const lifecycle1 = new TestLifecycle();
  const lifecycle2 = new TestLifecycle();

  expect(lifecycle1.key).toBeDefined();
  expect(lifecycle2.key).toBeDefined();
  expect(lifecycle1.key).not.toBe(lifecycle2.key);
  expect(lifecycle1.key).toMatch(/^TestLifecycle/);
});

test("initializes successfully and calls all initializers", () => {
  const lifecycle = new TestLifecycle();
  const initSpy1 = vi.fn();
  const initSpy2 = vi.fn();

  lifecycle.addInitializer(initSpy1);
  lifecycle.addInitializer(initSpy2);

  expect(lifecycle.initialized).toBe(false);
  lifecycle.initialize();
  expect(lifecycle.initialized).toBe(true);

  expect(initSpy1).toHaveBeenCalledOnce();
  expect(initSpy2).toHaveBeenCalledOnce();
});

test("throws if initialized twice", () => {
  const lifecycle = new TestLifecycle();

  lifecycle.initialize();
  expect(() => lifecycle.initialize()).toThrow(
    "Lifecycle instance is already initialized."
  );
});

test("cannot add initializer after initialization", () => {
  const lifecycle = new TestLifecycle();
  const initSpy = vi.fn();

  lifecycle.initialize();

  expect(() => lifecycle.addInitializer(initSpy)).toThrow(
    "Cannot add initializer to an already initialized Lifecycle instance."
  );
});

test("removes initializer correctly before initialization", () => {
  const lifecycle = new TestLifecycle();
  const initSpy1 = vi.fn();
  const initSpy2 = vi.fn();

  lifecycle.addInitializer(initSpy1);
  lifecycle.addInitializer(initSpy2);
  lifecycle.removeInitializer(initSpy1);

  lifecycle.initialize();

  expect(initSpy1).not.toHaveBeenCalled();
  expect(initSpy2).toHaveBeenCalledOnce();
});

test("dispose runs all disposers in order", () => {
  const lifecycle = new TestLifecycle();
  const callOrder: number[] = [];

  lifecycle.addDisposer(() => callOrder.push(1));
  lifecycle.addDisposer(() => callOrder.push(2));
  lifecycle.addDisposer(() => callOrder.push(3));

  expect(lifecycle.disposed).toBe(false);
  lifecycle.dispose();
  expect(lifecycle.disposed).toBe(true);

  expect(callOrder).toEqual([1, 2, 3]);
});

test("dispose ignores multiple calls (idempotent)", () => {
  const lifecycle = new TestLifecycle();
  const disposeSpy = vi.fn();

  lifecycle.addDisposer(disposeSpy);

  lifecycle.dispose();
  lifecycle.dispose();
  lifecycle.dispose();

  expect(disposeSpy).toHaveBeenCalledOnce();
});

test("cannot add disposer after disposal", () => {
  const lifecycle = new TestLifecycle();
  const disposeSpy = vi.fn();

  lifecycle.dispose();

  expect(() => lifecycle.addDisposer(disposeSpy)).toThrow(
    "Cannot add disposer to a disposed Lifecycle instance."
  );
});

test("removes disposer correctly before disposal", () => {
  const lifecycle = new TestLifecycle();
  const disposeSpy1 = vi.fn();
  const disposeSpy2 = vi.fn();

  lifecycle.addDisposer(disposeSpy1);
  lifecycle.addDisposer(disposeSpy2);
  lifecycle.removeDisposer(disposeSpy1);

  lifecycle.dispose();

  expect(disposeSpy1).not.toHaveBeenCalled();
  expect(disposeSpy2).toHaveBeenCalledOnce();
});

test("throws aggregated error if any disposer fails", () => {
  const lifecycle = new TestLifecycle();
  const error1 = new Error("Disposer 1 failed");
  const error2 = new Error("Disposer 2 failed");

  lifecycle.addDisposer(() => {
    throw error1;
  });
  lifecycle.addDisposer(() => {
    throw error2;
  });
  lifecycle.addDisposer(() => {}); // This should still run

  expect(() => lifecycle.dispose()).toThrow(
    /TestLifecycle dispose\(\) failed: 2 errors during cleanup/
  );
});

test("calls onInitialized after initialization", () => {
  const lifecycle = new TestLifecycle();

  expect(lifecycle.onInitializedCalled).toBe(false);
  lifecycle.initialize();
  expect(lifecycle.onInitializedCalled).toBe(true);
});

test("calls onDisposed after disposal", () => {
  const lifecycle = new TestLifecycle();

  expect(lifecycle.onDisposedCalled).toBe(false);
  lifecycle.dispose();
  expect(lifecycle.onDisposedCalled).toBe(true);
});

test("adds instance to Lifecycle.instances when tracking is enabled", () => {
  Lifecycle.track = true;
  const lifecycle = new TestLifecycle();

  expect(Lifecycle.instances.has(lifecycle)).toBe(false);
  lifecycle.initialize();
  expect(Lifecycle.instances.has(lifecycle)).toBe(true);
});

test("removes instance from Lifecycle.instances when disposed and tracking is enabled", () => {
  Lifecycle.track = true;
  const lifecycle = new TestLifecycle();

  lifecycle.initialize();
  expect(Lifecycle.instances.has(lifecycle)).toBe(true);

  lifecycle.dispose();
  expect(Lifecycle.instances.has(lifecycle)).toBe(false);
});

test("logs initialization when logger is provided", () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    withContext: vi.fn(),
  };

  Lifecycle.logger = mockLogger;
  const lifecycle = new TestLifecycle();

  lifecycle.initialize();

  expect(mockLogger.debug).toHaveBeenCalledWith("TestLifecycle initialized", {
    class: "TestLifecycle",
    instance: lifecycle,
  });
});

test("logs disposal when logger is provided", () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    withContext: vi.fn(),
  };

  Lifecycle.logger = mockLogger;
  const lifecycle = new TestLifecycle();

  lifecycle.dispose();

  expect(mockLogger.debug).toHaveBeenCalledWith("TestLifecycle disposed", {
    class: "TestLifecycle",
    instance: lifecycle,
  });
});

test("toString reflects initialized and disposed state", () => {
  const lifecycle = new TestLifecycle();

  expect(lifecycle.toString()).toBe(
    "TestLifecycle { initialized: false, disposed: false }"
  );

  lifecycle.initialize();
  expect(lifecycle.toString()).toBe(
    "TestLifecycle { initialized: true, disposed: false }"
  );

  lifecycle.dispose();
  expect(lifecycle.toString()).toBe(
    "TestLifecycle { initialized: true, disposed: true }"
  );
});
