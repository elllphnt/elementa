import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { complexInfrastructureData } from "../infrastructures/complex/infrastructure.js";
import {
  setupLifecycleTracking,
  teardownLifecycleTracking,
  validateLifecycleCleanup,
  withTestScene,
} from "../lifecycle.js";

beforeAll(() => {
  setupLifecycleTracking();
});

afterAll(() => {
  teardownLifecycleTracking();
});

afterEach(() => {
  validateLifecycleCleanup();
});

describe("Scene Integration Tests", () => {
  test("Scene with real project data", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ runtime, infrastructure, scene, stylesheetManager }) => {
        const project = infrastructure.project("complex");
        assert(project, "Project should exist");

        await project.app.untilRetrieved();
        const app = project.app.model;
        assert(app, "App should be loaded");

        // Test that scene can be used with runtime
        assert(
          scene.stylesheetDomManager === stylesheetManager,
          "Scene should have stylesheet manager"
        );
        assert(runtime, "Runtime should be available");

        // Scene and manager will be disposed automatically by withTestScene
      }
    );
  });

  test("Scene fragment lifecycle management", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ infrastructure, scene }) => {
        const project = infrastructure.project("complex");
        assert(project, "Project should exist");

        await project.app.untilRetrieved();
        const app = project.app.model;
        assert(app, "App should be loaded");

        const routerAdaptor = app.router;
        assert(routerAdaptor, "Router adaptor should exist");
        await routerAdaptor.untilRetrieved();
        const router = routerAdaptor.model;
        assert(router, "Router should be loaded");

        // Get the first route as an example
        if (router.routes.length > 0) {
          const route = router.routes[0];
          if (route.mainViewComponent) {
            await route.mainViewComponent.untilRetrieved();
            const component = route.mainViewComponent.model;
            if (component && component.template) {
              // Create a mock fragment for testing
              const mockFragment = {
                id: "test-fragment",
                environment: { project },
                allCssStylesheets$: new (await import("rxjs")).BehaviorSubject(
                  []
                ),
              } as any;

              // Test fragment registration
              scene.registerFragment(mockFragment);

              // Test fragment unregistration
              scene.unregisterFragment(mockFragment);
            }
          }
        }

        // Scene and manager will be disposed automatically by withTestScene
      }
    );
  });

  test("Multiple scene instances", async () => {
    // Create two separate test scenes to ensure they're independent
    const results = await Promise.all([
      withTestScene(
        {
          infrastructureData: complexInfrastructureData,
          externals: ["rxjs", "@elllphnt/elementa-base"],
        },
        async ({ scene, stylesheetManager }) => ({
          sceneKey: scene.key,
          managerRef: stylesheetManager,
        })
      ),
      withTestScene(
        {
          infrastructureData: complexInfrastructureData,
          externals: ["rxjs", "@elllphnt/elementa-base"],
        },
        async ({ scene, stylesheetManager }) => ({
          sceneKey: scene.key,
          managerRef: stylesheetManager,
        })
      ),
    ]);

    // Verify scenes are independent
    assert(
      results[0].managerRef !== results[1].managerRef,
      "Scenes should have different managers"
    );
    assert(
      results[0].sceneKey !== results[1].sceneKey,
      "Scenes should have different keys"
    );
  });

  test("Scene error handling", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        // Test safe operations after disposal
        scene.dispose();

        // These should not throw errors
        scene.unregisterFragment({} as any);

        // Manager will be disposed automatically by withTestScene
      }
    );
  });
});
