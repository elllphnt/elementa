import { test } from "uvu";
import * as assert from "uvu/assert";
import * as y from "yjs";
import { BlueprintAppState } from "../src";
import { App } from "../src/app/app";

test("initial state", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = new App({ project: {} as any, ymap });

  assert.is(app.route("foo"), undefined);
  let rVal: any;
  app.route$("foo").subscribe((v) => (rVal = v));
  assert.is(rVal, undefined);

  assert.is(app.variable("bar"), undefined);
  let vVal: any;
  app.variable$("bar").subscribe((v) => (vVal = v));
  assert.is(vVal, undefined);
});

test("add route", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = new App({ project: {} as any, ymap });
  const routes = ymap.get("routes") as y.Array<y.Map<any>>;

  const item = new y.Map();
  item.set("id", "r1");
  item.set("path", "/home");
  item.set("parentId", null);
  item.set("mainViewUrl", "/main");
  item.set("errorViewUrl", "/error");
  item.set("pendingViewUrl", "/pending");
  item.set("notFoundViewUrl", "/404");
  item.set("loaderUrl", "/loader");
  item.set("handlerUrl", "/handler");

  routes.push([item]);
  const route = app.route("r1")!;
  assert.is(route.id, "r1");
  assert.is(route.path, "/home");
});

test("add variable", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = new App({ project: {} as any, ymap });
  const vars = ymap.get("variables") as y.Array<y.Map<any>>;

  const vItem = new y.Map();
  vItem.set("varName", "vid1");
  vItem.set("name", "testVar");
  vItem.set("tsType", "string");
  vItem.set("scope", "local");
  vItem.set("description", "a test variable");

  vars.push([vItem]);
  const variable = app.variable("vid1")!;
  assert.is(variable.varName, "vid1");
  assert.is(variable.name, "testVar");
  assert.is(variable.tsType, "string");
  assert.is(variable.scope, "local");
  assert.is(variable.description, "a test variable");
});

test("variable by varName", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = new App({ project: {} as any, ymap });
  const vars = ymap.get("variables") as y.Array<y.Map<any>>;

  const vItem1 = new y.Map();
  vItem1.set("varName", "vid1");
  vItem1.set("name", "testVar");
  vItem1.set("tsType", "string");
  vItem1.set("scope", "local");
  vItem1.set("description", "a test variable");

  const vItem2 = new y.Map();
  vItem2.set("varName", "vid2");
  vItem2.set("name", "anotherVar");
  vItem2.set("tsType", "number");
  vItem2.set("scope", "global");
  vItem2.set("description", "another test variable");

  vars.push([vItem1, vItem2]);

  const variable1 = app.variable("vid1")!;
  assert.is(variable1.varName, "vid1");
  assert.is(variable1.name, "testVar");

  const variable2 = app.variable("vid2")!;
  assert.is(variable2.varName, "vid2");
  assert.is(variable2.name, "anotherVar");
});

test("route by id", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = new App({ project: {} as any, ymap });
  const routes = ymap.get("routes") as y.Array<y.Map<any>>;

  const item1 = new y.Map();
  item1.set("id", "r1");
  item1.set("path", "/home");

  const item2 = new y.Map();
  item2.set("id", "r2");
  item2.set("path", "/about");

  routes.push([item1, item2]);

  const route1 = app.route("r1")!;
  assert.is(route1.id, "r1");
  assert.is(route1.path, "/home");

  const route2 = app.route("r2")!;
  assert.is(route2.id, "r2");
  assert.is(route2.path, "/about");
});

test("blueprint editor", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = new App({ project: {} as any, ymap });

  const blueprint = new BlueprintAppState(
    app.editors.getOrCreateMap("blueprint")
  );

  // add a node
  blueprint.nodes.set();
});
