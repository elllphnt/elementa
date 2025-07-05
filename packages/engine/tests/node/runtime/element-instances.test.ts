import {
  DefaultElementRuntimeEnvironment,
  createElementInstance,
} from "@elllphnt/elementa-runtime";
import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { complexInfrastructureData } from "../infrastructures/complex/infrastructure.js";
import {
  setupLifecycleTracking,
  teardownLifecycleTracking,
  validateLifecycleCleanup,
  withTestRuntime,
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

describe("Element Instances", () => {
  test("Element environment functionality", async () => {
    await withTestRuntime(
      { infrastructureData: complexInfrastructureData, externals: ["rxjs"] },
      async ({ runtime }) => {
        // Test the default element runtime environment
        const environment = runtime.fragmentEnvironment;
        assert(
          environment instanceof DefaultElementRuntimeEnvironment,
          "Should use default environment"
        );
        assert(
          environment.runtime === runtime,
          "Environment should reference runtime"
        );
        assert(
          !environment.disposed,
          "Environment should not be disposed initially"
        );
      }
    );
  });

  test("Element instance creation with real elements", async () => {
    await withTestRuntime(
      { infrastructureData: complexInfrastructureData, externals: ["rxjs"] },
      async ({ runtime, infrastructure }) => {
        // Get a real project and component
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

        const homeRoute = router.routes[0];
        const homeComponentAdaptor = homeRoute.mainViewComponent;
        await homeComponentAdaptor?.untilRetrieved();
        const home = homeComponentAdaptor?.model;
        assert(home?.template, "Home component should have template");

        // Create element instance from real element
        const elementInstance = createElementInstance({
          element: home.template,
          environment: runtime.fragmentEnvironment,
        });
        elementInstance.initialize();

        // Verify instance properties
        assert(elementInstance, "Element instance should be created");
        assert(elementInstance.key, "Element instance should have a key");
        assert(
          elementInstance.element === home.template,
          "Element should be set"
        );
        assert(
          elementInstance.environment === runtime.fragmentEnvironment,
          "Environment should be set"
        );
        assert(
          !elementInstance.disposed,
          "Instance should not be disposed initially"
        );

        // Verify diagnostic properties
        assert(
          Array.isArray(elementInstance.diagnostics),
          "Diagnostics should be an array"
        );
        assert(
          elementInstance.diagnostics$,
          "Diagnostics observable should exist"
        );
        assert(
          typeof elementInstance.diagnosticLevel === "number",
          "Diagnostic level should be a number"
        );
        assert(
          elementInstance.diagnosticLevel$,
          "Diagnostic level observable should exist"
        );

        // Test disposal
        elementInstance.dispose();
        assert(
          elementInstance.disposed,
          "Instance should be disposed after dispose()"
        );
      }
    );
  });

  test("Element instance parent-child relationships", async () => {
    await withTestRuntime(
      { infrastructureData: complexInfrastructureData, externals: ["rxjs"] },
      async ({ runtime, infrastructure }) => {
        // Get a real element that might have children (container)
        const project = infrastructure.project("complex");
        await project.app.untilRetrieved();
        const app = project.app.model;
        assert(app, "App should be loaded");

        const routerAdaptor = app.router;
        assert(routerAdaptor, "Router adaptor should exist");
        await routerAdaptor.untilRetrieved();
        const router = routerAdaptor.model;
        assert(router, "Router should be loaded");
        const aboutRoute = router.routes.find((r) => r.path === "/about");

        if (aboutRoute?.mainViewComponent) {
          await aboutRoute.mainViewComponent.untilRetrieved();
          const aboutComponent = aboutRoute.mainViewComponent.model;

          if (aboutComponent?.template) {
            // Create parent instance
            const parentInstance = createElementInstance({
              element: aboutComponent.template,
              environment: runtime.fragmentEnvironment,
            });
            parentInstance.initialize();

            // Create a child instance with parent reference
            const childInstance = createElementInstance({
              element: aboutComponent.template,
              environment: runtime.fragmentEnvironment,
              parent: parentInstance,
            });
            childInstance.initialize();

            // Verify parent-child relationship
            assert(
              childInstance.parent === parentInstance,
              "Child should reference parent"
            );
            assert(
              childInstance.runtime === runtime,
              "Child should have runtime reference"
            );

            childInstance.dispose();
            parentInstance.dispose();
          }
        }
      }
    );
  });

  test("Element instance diagnostics integration", async () => {
    await withTestRuntime(
      { infrastructureData: complexInfrastructureData, externals: ["rxjs"] },
      async ({ runtime, infrastructure }) => {
        const project = infrastructure.project("complex");
        await project.app.untilRetrieved();
        const app = project.app.model;
        assert(app, "App should be loaded");
        const routerAdaptor = app.router;
        assert(routerAdaptor, "Router adaptor should exist");
        await routerAdaptor.untilRetrieved();
        const router = routerAdaptor.model;
        assert(router, "Router should be loaded");
        const homeRoute = router.routes[0];
        const homeComponentAdaptor = homeRoute.mainViewComponent;
        await homeComponentAdaptor?.untilRetrieved();
        const home = homeComponentAdaptor?.model;

        if (home?.template) {
          const elementInstance = createElementInstance({
            element: home.template,
            environment: runtime.fragmentEnvironment,
          });
          elementInstance.initialize();

          // Test diagnostic observables
          let diagnosticsReceived = false;
          let levelReceived = false;

          const diagSub = elementInstance.diagnostics$.subscribe((diags) => {
            diagnosticsReceived = true;
            assert(Array.isArray(diags), "Diagnostics should be array");
          });

          const levelSub = elementInstance.diagnosticLevel$.subscribe(
            (level) => {
              levelReceived = true;
              assert(typeof level === "number", "Level should be number");
            }
          );

          // Give observables a moment to emit
          await new Promise((resolve) => setTimeout(resolve, 10));

          assert(diagnosticsReceived, "Should receive diagnostics");
          assert(levelReceived, "Should receive diagnostic level");

          diagSub.unsubscribe();
          levelSub.unsubscribe();
          elementInstance.dispose();
        }
      }
    );
  });
});
