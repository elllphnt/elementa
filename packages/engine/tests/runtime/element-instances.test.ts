import {
  DefaultElementRuntimeEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
  createElementInstance,
} from "@elllphnt/elementa-runtime";
import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { complexInfrastructureData } from "../infrastructures/complex/infrastructure.js";
import {
  setupLifecycleTracking,
  teardownLifecycleTracking,
  validateLifecycleCleanup,
  withTestInfrastructure,
} from "../lifecycle-tracking.js";

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
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });
        const runtime = new Runtime({ moduleManager });

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

        runtime.dispose();
        assert(
          environment.disposed,
          "Environment should be disposed with runtime"
        );
      }
    );
  });

  test("Element instance creation with real elements", async () => {
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });
        const runtime = new Runtime({ moduleManager });

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

        runtime.dispose();
      }
    );
  });

  test("Element instance parent-child relationships", async () => {
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });
        const runtime = new Runtime({ moduleManager });

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

            // Create a child instance with parent reference
            const childInstance = createElementInstance({
              element: aboutComponent.template,
              environment: runtime.fragmentEnvironment,
              parent: parentInstance,
            });

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

        runtime.dispose();
      }
    );
  });

  test("Element instance diagnostics integration", async () => {
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });
        const runtime = new Runtime({ moduleManager });

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

        runtime.dispose();
      }
    );
  });
});
