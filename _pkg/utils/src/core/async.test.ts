import { test } from "uvu";
import * as assert from "uvu/assert";
import { retryAsync, withTimeout } from "./async";

// withTimeout should resolve if inner promise settles before the timer
test("withTimeout resolves before timeout", async () => {
  const result = await withTimeout(Promise.resolve(123), 50);
  assert.is(result, 123);
});

// withTimeout should reject when the timer elapses first
test("withTimeout rejects on timeout", async () => {
  try {
    await withTimeout(new Promise(() => {}), 10, "too slow");
    assert.unreachable("Expected to throw on timeout");
  } catch (err: any) {
    assert.instance(err, Error);
    assert.match(err.message, /too slow/);
  }
});

// retryAsync returns immediately on first success
test("retryAsync succeeds on first try", async () => {
  let calls = 0;
  const fn = async () => {
    calls++;
    return "ok";
  };
  const res = await retryAsync(fn, 3, 5);
  assert.is(res, "ok");
  assert.is(calls, 1);
});

// retryAsync retries once then succeeds
test("retryAsync retries before success", async () => {
  let calls = 0;
  const fn = async () => {
    calls++;
    if (calls < 2) throw new Error("fail");
    return "good";
  };
  const res = await retryAsync(fn, 3, 5);
  assert.is(res, "good");
  assert.is(calls, 2);
});

// retryAsync throws after max retries
test("retryAsync throws after all retries", async () => {
  let calls = 0;
  const fn = async () => {
    calls++;
    throw new Error("nope");
  };
  try {
    await retryAsync(fn, 2, 5);
    assert.unreachable("Should have thrown after retries");
  } catch (err: any) {
    assert.instance(err, Error);
  }
  assert.is(calls, 2);
});

test.run();
