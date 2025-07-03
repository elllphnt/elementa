import type { TextElement } from "@elllphnt/elementa-models";
import { assert, test } from "vitest";
import { TestInfrastructure } from "./infrastructure.js";
import { simpleInfrastructureData } from "./infrastructures/simple/instrastructure.js";
import { appData } from "./infrastructures/simple/simple/files/app.js";
import { routerData } from "./infrastructures/simple/simple/files/router.js";
import { simpleProjectData } from "./infrastructures/simple/simple/project.js";

test("Simple Test", async () => {
  const infrastructure = new TestInfrastructure({
    data: simpleInfrastructureData,
  });
  infrastructure.initialize();
  const project = infrastructure.project(simpleProjectData.id);
  assert(project);
  await project.app.untilRetrieved();
  const app = project.app.model;
  assert(app);
  assert.equal(app.routerUrl, appData.routerUrl);
  const routerAdaptor = app.router;
  assert(routerAdaptor);
  await routerAdaptor.untilRetrieved();
  const router = routerAdaptor.model;
  assert(router);
  assert.equal(router?.route.length, routerData.routes?.length);
  const homeRoute = router?.routes[0];
  assert(homeRoute);
  const homeComponentAdaptor = homeRoute.mainViewComponent;
  await homeComponentAdaptor?.untilRetrieved();
  const home = homeComponentAdaptor?.model;
  assert(home);
  assert(home.template);
  assert.equal(home.template.type, "text");
  const text = (home.template as TextElement).text;
  assert.equal(text, "Simple App");
});
