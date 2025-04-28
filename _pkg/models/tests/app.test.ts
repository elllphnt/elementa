import { test } from "uvu";
import * as assert from "uvu/assert";
import * as y from "yjs";
import { attachApp, createApp } from "../src/app/app";
import { createRoute } from "../src/app/route";
import { createAppVariable } from "../src/app/variable";
import { Project } from "../src/project/project";

test("initial state", () => {
  const app = createApp({} as Project);

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
  const app = attachApp(ymap, {} as Project);

  assert.equal(app.routes.length, 0);

  const route = createRoute(app);
  app.routes.push([route]);

  assert.equal(app.routes.length, 1);

  route.path = "/test";
  route.parentId = "p1";
  route.mainViewUrl = "/main";
  route.errorViewUrl = "/error";
  route.pendingViewUrl = "/pending";
  route.notFoundViewUrl = "/not-found";
  route.loaderUrl = "/loader";
  route.handlerUrl = "/handler";

  const appJson = app.toJSON();

  assert.equal(appJson.routes.length, 1);
  assert.equal(appJson.routes[0].path, "/test");
  assert.equal(appJson.routes[0].id, route.id);
  assert.equal(appJson.routes[0].parentId, "p1");
  assert.equal(appJson.routes[0].mainViewUrl, "/main");
  assert.equal(appJson.routes[0].errorViewUrl, "/error");
  assert.equal(appJson.routes[0].pendingViewUrl, "/pending");
  assert.equal(appJson.routes[0].notFoundViewUrl, "/not-found");
  assert.equal(appJson.routes[0].loaderUrl, "/loader");
  assert.equal(appJson.routes[0].handlerUrl, "/handler");
});

test("add variable", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = attachApp(ymap, {} as Project);

  assert.equal(app.variables.length, 0);

  const variable = createAppVariable(app);
  app.variables.push([variable]);

  assert.equal(app.variables.length, 1);

  variable.varName = "bar";
  variable.name = "var";
  variable.tsType = "string";
  variable.scope = "local";
  variable.description = "description";

  const appJson = app.toJSON();

  assert.equal(appJson.variables.length, 1);
  assert.equal(appJson.variables[0].varName, "bar");
  assert.equal(appJson.variables[0].name, "var");
  assert.equal(appJson.variables[0].tsType, "string");
  assert.equal(appJson.variables[0].scope, "local");
  assert.equal(appJson.variables[0].description, "description");
});

test("blueprint editor", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = attachApp(ymap, {} as Project);

  const variable = createAppVariable(app);
  app.variables.push([variable]);

  assert.equal(app.variables.length, 1);

  variable.varName = "bar";
  variable.name = "var";
  variable.tsType = "string";
  variable.scope = "local";
  variable.description = "description";

  const appJson = app.toJSON();

  assert.equal(appJson.variables.length, 1);
  assert.equal(appJson.variables[0].varName, "bar");
  assert.equal(appJson.variables[0].name, "var");
  assert.equal(appJson.variables[0].tsType, "string");
  assert.equal(appJson.variables[0].scope, "local");
  assert.equal(appJson.variables[0].description, "description");
});

test("observable and dispose", () => {
  const doc = new y.Doc();
  const ymap = doc.getMap<any>("app");
  const app = attachApp(ymap, {} as Project);
  const appEvents: any[] = [];
  const routesEvents: any[] = [];
  app.observable$.subscribe((e) => appEvents.push(e));
  app.routes.observable$.subscribe((e) => routesEvents.push(e));
  assert.equal(appEvents.length, 1);
  assert.equal(routesEvents.length, 1);

  const routeEvents: any[] = [];
  const route = createRoute(app);
  route.observable$.subscribe((e) => routeEvents.push(e));
  assert.equal(routeEvents.length, 1);

  app.routes.push([route]);
  assert.equal(routesEvents.length, 2);

  ymap.set("foo", "bar1");
  assert.equal(appEvents.length, 2);

  app.dispose();

  ymap.set("foo", "bar2");
  assert.equal(appEvents.length, 2);
});

test("app sync", () => {
  const doc1 = new y.Doc();
  const doc2 = new y.Doc();

  doc1.on("update", (update) => {
    y.applyUpdate(doc2, update);
  });

  const ymap1 = doc1.getMap<any>("app");
  const ymap2 = doc2.getMap<any>("app");
  const app1 = attachApp(ymap1, {} as Project);
  const app2 = attachApp(ymap2, {} as Project);

  // initial state
  assert.equal(app1.toJSON(), app2.toJSON());
  assert.equal(app2.routes.length, 0);
  assert.equal(app2.variables.length, 0);

  // add sub models
  const route = createRoute(app1);
  const variable = createAppVariable(app1);
  app1.routes.push([route]);
  app1.variables.push([variable]);

  assert.equal(app2.routes.length, 1);
  assert.equal(app2.variables.length, 1);

  // edit sub models
  route.path = "path";
  variable.name = "x";

  assert.equal(app2.routes.get(0).path, route.path);
  assert.equal(app2.variables.get(0).name, variable.name);
});
