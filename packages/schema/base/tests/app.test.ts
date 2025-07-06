import { test } from "vitest";
import type {
  AppData,
  ComponentData} from "../src/index.js";
import {
  componentSchema,
  routerSchema,
} from "../src/index.js";

test("empty schema", () => {
  const app: AppData = {};
  const component: ComponentData = {};
  routerSchema.parse(app);
  componentSchema.parse(component);
});
