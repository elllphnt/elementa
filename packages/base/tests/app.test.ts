import { test } from "vitest";
import {
  AppData,
  ComponentData,
  componentSchema,
  routerSchema,
} from "../src/index.js";

test("empty schema", () => {
  const app: AppData = {};
  const component: ComponentData = {};
  routerSchema.parse(app);
  componentSchema.parse(component);
});
