import type {
  Component,
  ContainerElement,
  Router,
  TextElement,
} from "@elllphnt/elementa-models";
import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { TestInfrastructure } from "../infrastructure.js";
import { complexInfrastructureData } from "../infrastructures/complex/infrastructure.js";
import {
  setupLifecycleTracking,
  teardownLifecycleTracking,
  validateLifecycleCleanup,
} from "../lifecycle-tracking.js";

beforeAll(() => {
  setupLifecycleTracking();
});

afterAll(() => {
  teardownLifecycleTracking();
});

afterEach(() => {
  // Validate that tests properly disposed all lifecycle instances
  validateLifecycleCleanup();
});

// Helper function to get router model
async function getRouterModel(project: any): Promise<Router> {
  await project.app.untilRetrieved();
  const app = project.app.model;
  assert(app, "App should be loaded");

  const routerAdaptor = app.router;
  assert(routerAdaptor, "Router adaptor should exist");

  await routerAdaptor.untilRetrieved();
  const router = routerAdaptor.model as Router;
  assert(router, "Router should be loaded");

  return router;
}

describe("Router Model Tests", () => {
  test("Router Routes and Navigation", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    // Test route structure
    assert.equal(router.routes.length, 4, "Should have 4 routes");

    const routes = router.routes;
    assert.equal(routes[0].path, "/", "First route should be home");
    assert.equal(routes[1].path, "/about", "Second route should be about");
    assert.equal(routes[2].path, "/contact", "Third route should be contact");
    assert.equal(
      routes[3].path,
      "/dashboard/:userId",
      "Fourth route should be dashboard with parameter"
    );

    // Test route components
    for (const route of routes) {
      assert(route.id, "Route should have id");
      assert(route.path, "Route should have path");
      assert(route.mainViewComponent, "Route should have main view component");
    }

    // Cleanup
    infrastructure.dispose();
  });

  test("Route Parameter Parsing", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    const dashboardRoute = router.routes.find((r) =>
      r.path?.includes(":userId")
    );
    assert(dashboardRoute, "Should have dashboard route with parameter");
    assert(
      dashboardRoute.path?.includes(":userId"),
      "Dashboard route should have userId parameter"
    );

    // Cleanup
    infrastructure.dispose();
  });
});

describe("Component Model Tests", () => {
  test("Component Props and States", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    // Test home component
    const homeRoute = router.routes[0];
    const homeComponentAdaptor = homeRoute.mainViewComponent;
    await homeComponentAdaptor?.untilRetrieved();
    const home = homeComponentAdaptor?.model as Component;

    // Test props
    assert(home.props, "Component should have props");
    assert.equal(home.props.length, 1, "Should have 1 prop");
    const titleProp = home.props[0];
    assert.equal(titleProp.name, "title", "Prop should be named title");
    assert.equal(titleProp.tsType, "string", "Prop should be string type");

    // Test states
    assert(home.states, "Component should have states");
    assert.equal(home.states.length, 1, "Should have 1 state");
    const counterState = home.states[0];
    assert.equal(counterState.name, "counter", "State should be named counter");
    assert.equal(counterState.type, "value", "State should be value type");

    // Cleanup
    infrastructure.dispose();
  });

  test("Component Template Structure", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    const homeRoute = router.routes[0];
    const homeComponentAdaptor = homeRoute.mainViewComponent;
    await homeComponentAdaptor?.untilRetrieved();
    const home = homeComponentAdaptor?.model as Component;

    // Test template
    assert(home.template, "Component should have template");
    assert.equal(
      home.template.type,
      "container",
      "Template should be container"
    );

    const container = home.template as ContainerElement;
    assert(container.content, "Container should have content");
    assert.equal(
      container.content.length,
      3,
      "Container should have 3 children"
    );

    // Test first text element
    const firstText = container.content[0] as TextElement;
    assert.equal(firstText.type, "text", "First element should be text");
    assert(firstText.text, "Text element should have text content");

    // Cleanup
    infrastructure.dispose();
  });

  test("Component Fragments", async () => {
    const infrastructure = new TestInfrastructure({
      data: complexInfrastructureData,
    });
    infrastructure.initialize();

    const project = infrastructure.project("complex");
    const router = await getRouterModel(project);

    // Test about component fragments
    const aboutRoute = router.routes[1];
    const aboutComponentAdaptor = aboutRoute.mainViewComponent;
    await aboutComponentAdaptor?.untilRetrieved();
    const about = aboutComponentAdaptor?.model as Component;

    assert(about.fragments, "About component should have fragments");
    assert.equal(about.fragments.length, 1, "Should have 1 fragment");

    const fragment = about.fragments[0];
    assert.equal(
      fragment.name,
      "AboutContent",
      "Fragment should be named AboutContent"
    );
    assert(fragment.content, "Fragment should have content");
    assert.equal(fragment.content.length, 2, "Fragment should have 2 elements");

    // Cleanup
    infrastructure.dispose();
  });
});
