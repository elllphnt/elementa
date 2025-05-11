import { test } from "vitest";
import {
  AppData,
  appSchema,
  ComponentData,
  componentSchema,
} from "../src/index.js";

test("empty schema", () => {
  const app: AppData = {};
  const component: ComponentData = {};
  appSchema.parse(app);
  componentSchema.parse(component);
});
