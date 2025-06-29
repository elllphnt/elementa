import { AppData } from "@elllphnt/elementa-base";
import { JsonRecordState } from "@elllphnt/elementa-utils";
import { assert } from "console";
import { test } from "vitest";
import { App } from "~/models/app/app.js";

test("Null App", () => {
  const state = new JsonRecordState<AppData>({});
  const app = new App({
    state,
  });
  assert(app);
});
