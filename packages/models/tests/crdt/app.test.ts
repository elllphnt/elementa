import { beforeEach, describe, expect, it } from "vitest";
import * as y from "yjs";
import { genId } from "~/_lib/id.js";
import { CrdtRouter } from "~/index.js";

describe("CRDT App Model", () => {
  let doc: y.Doc;
  let root: y.Map<any>;
  let app: CrdtRouter;

  beforeEach(() => {
    doc = new y.Doc();
    root = doc.getMap("app");

    app = new CrdtRouter(root, {
      project: {
        absoluteFileUrl: (url: string) => url,
        infrastructure: {
          component: (url: string) => ({ url }),
        },
      },
    } as any);
  });

  it("creates and adds a root route", () => {
    const route = app.createRoute({ path: "/home" });
    app.addRoutes([route]);

    expect(route.path).toBe("/home");
    expect(app.routes.length).toBe(1);
    expect(app.routes[0].path).toBe("/home");
  });

  it("supports nested route structure", () => {
    const parent = app.createRoute({ path: "/parent" });
    const child = app.createRoute({ path: "/parent/child" });

    app.addRoutes([parent]);
    parent.addRoutes([child]);
    expect(parent.children.length).toBe(1);
    expect(parent.children[0].path).toBe("/parent/child");

    parent.removeRoutes([child]);
    expect(parent.children.length).toBe(0);
  });

  it("exposes view component accessors", () => {
    const route = app.createRoute({ path: "/", mainViewUrl: "./Main.js" });
    app.addRoutes([route]);

    // expect(route.mainViewComponent?.url).toBe("./Main.js");
  });

  it("creates, updates, and removes a blueprint node", () => {
    const blueprint = app.blueprint;
    const nodeId = genId();

    const node = blueprint.node(nodeId, true);
    expect(node).toBeDefined();
    expect(node.id).toBe(nodeId);
    expect(node.position.x).toBe(0);
    expect(node.position.y).toBe(0);

    node.setPosition({ x: 100, y: 200 });

    const updated = blueprint.node(nodeId);
    expect(updated?.position.x).toBe(100);
    expect(updated?.position.y).toBe(200);

    blueprint.removeNode(nodeId);
    const removed = blueprint.node(nodeId);
    expect(removed).toBeUndefined();
  });

  it("updates route fields reactively", () => {
    const route = app.createRoute({
      path: "/reactive",
      mainViewUrl: "./Old.js",
    });
    app.addRoutes([route]);

    // expect(route.mainViewComponent?.url).toBe("./Old.js");

    route.setMainViewUrl("./Updated.js");
    // expect(route.mainViewComponent?.url).toBe("./Updated.js");
  });

  it("can lookup route by ID", () => {
    const route = app.createRoute({ path: "/find-me" });
    app.addRoutes([route]);

    const found = app.route(route.id);
    expect(found).toBe(route);
  });

  it("can insert and remove routes by index", () => {
    const r1 = app.createRoute({ path: "/r1" });
    const r2 = app.createRoute({ path: "/r2" });

    app.insertRoutes(0, [r2]);
    app.insertRoutes(0, [r1]);

    expect(app.routes[0]).toBe(r1);
    expect(app.routes[1]).toBe(r2);

    app.removeRoutes([r1]);
    expect(app.routes[0]).toBe(r2);
  });

  it.only("can move a set of routes from on parent to the other", () => {
    const r1 = app.createRoute({ path: "/r1" });
    const r2 = app.createRoute({ path: "/r2" });
    const r3 = app.createRoute({ path: "/r3" });
    const r4 = app.createRoute({ path: "/r4" });

    app.addRoutes([r1, r2]);
    r1.addRoutes([r3, r4]);

    expect(app.routes[0]).toBe(r1);
    expect(app.routes[1]).toBe(r2);
    expect(r1.children[0]).toBe(r3);
    expect(r1.children[1]).toBe(r4);

    doc.transact(() => {
      console.log("Will Remove");
      r1.removeRoutes([r3, r4]);
      console.log("Removed");
      console.log("Will Add");
      r2.addRoutes([r3, r4]);
      console.log("Added");
    });
    expect(r2.children[0]).toBe(r3);
    expect(r2.children[1]).toBe(r4);
  });
});
