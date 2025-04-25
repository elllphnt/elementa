import { test } from "uvu";
import { assert } from "./assert";

test("assert does not throw when condition is truthy", () => {
  assert(true);
  assert(42, "non-zero is truthy");
});

test.run();
