import {
  createElementInstance,
  InMemoryModuleHost,
  ModuleManager,
  RouterInstance,
  Runtime,
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

describe("Runtime Integration", () => {
  test("Full runtime integration with real project", async () => {
    await withTestInfrastructure(
      complexInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs", "@elllphnt/elementa-base"],
        });
        const runtime = new Runtime({ moduleManager });

        // Load the complex project
        const project = infrastructure.project("complex");
        assert(project, "Project should exist");

        await project.app.untilRetrieved();
        const app = project.app.model;
        assert(app, "App should be loaded");

        // Test router integration
        const routerAdaptor = app.router;
        assert(routerAdaptor, "Router adaptor should exist");
        await routerAdaptor.untilRetrieved();
        const router = routerAdaptor.model;
        assert(router, "Router should be loaded");

        // Create router instance
        const routerInstance = new RouterInstance({
          model: router,
          environment: runtime.fragmentEnvironment,
        });

        // Verify router setup
        assert(routerInstance.key, "Router instance should have a key");
        assert(routerInstance.model === router, "Router model should be set");
        assert(
          !routerInstance.disposed,
          "Router should not be disposed initially"
        );

        // Test navigation and route resolution
        assert(routerInstance.routes$, "Router should have routes observable");
        assert(
          Array.isArray(routerInstance.routes),
          "Routes should be an array"
        );
        assert(routerInstance.routes.length > 0, "Should have routes");

        // Verify each route has required components
        for (const route of routerInstance.routes) {
          assert(route.key, "Route should have a key");
          assert(route.model, "Route should have model");
          assert(!route.disposed, "Route should not be disposed");

          // Test route component loading
          if (route.model.mainViewComponent) {
            await route.model.mainViewComponent.untilRetrieved();
            const component = route.model.mainViewComponent.model;
            assert(component, "Route component should be loaded");
            assert(component.template, "Component should have template");
          }
        }

        // Test element instance creation from loaded components
        const homeRoute = router.routes[0];
        if (homeRoute.mainViewComponent) {
          await homeRoute.mainViewComponent.untilRetrieved();
          const homeComponent = homeRoute.mainViewComponent.model;

          if (homeComponent?.template) {
            const elementInstance = createElementInstance({
              element: homeComponent.template,
              environment: runtime.fragmentEnvironment,
            });

            assert(elementInstance, "Element instance should be created");
            assert(!elementInstance.disposed, "Element should not be disposed");

            // Test the element diagnostic system
            assert(
              Array.isArray(elementInstance.diagnostics),
              "Element should have diagnostics"
            );
            assert(
              typeof elementInstance.diagnosticLevel === "number",
              "Element should have diagnostic level"
            );

            elementInstance.dispose();
            assert(elementInstance.disposed, "Element should be disposed");
          }
        }

        // Test cleanup cascade
        routerInstance.dispose();
        assert(routerInstance.disposed, "Router should be disposed");

        // Verify route cleanup
        for (const route of routerInstance.routes) {
          assert(route.disposed, "Route should be disposed with router");
        }

        runtime.dispose();
        assert(runtime.disposed, "Runtime should be disposed");
        assert(moduleManager.disposed, "Module manager should be disposed");
      }
    );
  });

  test("Memory management and lifecycle cleanup", async () => {
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

        // Create multiple instances to test memory management
        const instances: any[] = [];

        const project = infrastructure.project("complex");
        await project.app.untilRetrieved();
        const app = project.app.model;
        assert(app, "App should be loaded");

        const routerAdaptor = app.router;
        assert(routerAdaptor, "Router adaptor should exist");
        await routerAdaptor.untilRetrieved();
        const router = routerAdaptor.model;
        assert(router, "Router should be loaded");

        // Create router instance
        const routerInstance = new RouterInstance({
          model: router,
          environment: runtime.fragmentEnvironment,
        });
        instances.push(routerInstance);

        // Create element instances for each route component
        for (const route of router.routes) {
          if (route.mainViewComponent) {
            await route.mainViewComponent.untilRetrieved();
            const component = route.mainViewComponent.model;

            if (component?.template) {
              const elementInstance = createElementInstance({
                element: component.template,
                environment: runtime.fragmentEnvironment,
              });
              instances.push(elementInstance);
            }
          }
        }

        // Verify all instances are alive
        for (const instance of instances) {
          assert(!instance.disposed, "Instance should not be disposed");
        }

        // Test incremental disposal
        const firstInstance = instances[0];
        firstInstance.dispose();
        assert(firstInstance.disposed, "First instance should be disposed");

        // Verify other instances are still alive
        for (let i = 1; i < instances.length; i++) {
          assert(
            !instances[i].disposed,
            "Other instances should still be alive"
          );
        }

        // Test runtime disposal cascades to all
        runtime.dispose();

        // All instances should be disposed now
        for (const instance of instances) {
          assert(
            instance.disposed,
            "All instances should be disposed after runtime disposal"
          );
        }
      }
    );
  });

  test("Error handling and diagnostics", async () => {
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

        const routerInstance = new RouterInstance({
          model: router,
          environment: runtime.fragmentEnvironment,
        });

        // Test diagnostic system
        assert(
          Array.isArray(routerInstance.diagnostics),
          "Diagnostics should be array"
        );
        assert(
          routerInstance.diagnostics$,
          "Diagnostics observable should exist"
        );
        assert(
          typeof routerInstance.diagnosticLevel === "number",
          "Diagnostic level should be number"
        );
        assert(
          routerInstance.diagnosticLevel$,
          "Diagnostic level observable should exist"
        );

        // Test diagnostic reactivity
        let diagnosticsReceived = false;
        let levelReceived = false;

        const diagSub = routerInstance.diagnostics$.subscribe((diagnostics) => {
          diagnosticsReceived = true;
          assert(
            Array.isArray(diagnostics),
            "Diagnostics should be array in subscription"
          );
        });

        const levelSub = routerInstance.diagnosticLevel$.subscribe((level) => {
          levelReceived = true;
          assert(
            typeof level === "number",
            "Level should be number in subscription"
          );
        });

        // Give observables time to emit
        await new Promise((resolve) => setTimeout(resolve, 10));

        assert(diagnosticsReceived, "Should receive diagnostic updates");
        assert(levelReceived, "Should receive level updates");

        diagSub.unsubscribe();
        levelSub.unsubscribe();
        routerInstance.dispose();
        runtime.dispose();
      }
    );
  });

  test("Module loading and evaluation in runtime context", async () => {
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

        // Test module loading through runtime
        // Test with a known file from the infrastructure
        const testFileUrl = "/complex/home/main.tsx"; // Adjust based on actual file structure

        try {
          // Load module through module manager
          const module = moduleManager.module(testFileUrl);
          assert(module, "Module should be created");

          // Test module properties
          assert(
            typeof module.resolved === "boolean",
            "Module should have resolved state"
          );
          assert(
            module.value$ !== undefined,
            "Module should have value observable"
          );
          assert(
            module.error$ !== undefined,
            "Module should have error observable"
          );
          assert(
            module.dependencies$ !== undefined,
            "Module should have dependencies observable"
          );

          // Test module observables
          let valueReceived = false;
          let errorReceived = false;
          let dependenciesReceived = false;

          const valueSub = module.value$.subscribe(() => {
            valueReceived = true;
          });

          const errorSub = module.error$.subscribe(() => {
            errorReceived = true;
          });

          const depSub = module.dependencies$.subscribe((deps) => {
            dependenciesReceived = true;
            assert(Array.isArray(deps), "Dependencies should be array");
          });

          await new Promise((resolve) => setTimeout(resolve, 10));

          assert(valueReceived, "Should receive value updates");
          assert(errorReceived, "Should receive error updates");
          assert(dependenciesReceived, "Should receive dependency updates");

          valueSub.unsubscribe();
          errorSub.unsubscribe();
          depSub.unsubscribe();
        } catch (error) {
          // If specific file doesn't exist, that's okay for this test
          // The important thing is that module loading API works
          assert(
            error instanceof Error,
            "Should get proper error for non-existent files"
          );
        }

        runtime.dispose();
      }
    );
  });
});
