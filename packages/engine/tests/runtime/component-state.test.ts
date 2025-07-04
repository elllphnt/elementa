import {
  ComponentInstance,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
  StaticComponentInputResolver,
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

describe("Component and State Management", () => {
  test("ComponentInstance creation and lifecycle", async () => {
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

        // Get a real component from the infrastructure
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
        assert(homeComponentAdaptor, "Home component adaptor should exist");
        await homeComponentAdaptor.untilRetrieved();
        const homeComponent = homeComponentAdaptor.model;
        assert(homeComponent, "Home component should be loaded");

        // Create input resolver for component
        const inputResolver = new StaticComponentInputResolver({
          environment: runtime.fragmentEnvironment,
          props: {},
        });

        // Create component instance
        const componentInstance = new ComponentInstance({
          model: homeComponent,
          inputResolver,
        });

        // Verify instance properties
        assert(componentInstance.key, "Component instance should have a key");
        assert(
          componentInstance.model === homeComponent,
          "Model should be set"
        );
        assert(
          !componentInstance.disposed,
          "Instance should not be disposed initially"
        );

        // Verify diagnostic properties
        assert(
          Array.isArray(componentInstance.diagnostics),
          "Diagnostics should be an array"
        );
        assert(
          componentInstance.diagnostics$,
          "Diagnostics observable should exist"
        );
        assert(
          typeof componentInstance.diagnosticLevel === "number",
          "Diagnostic level should be a number"
        );

        // Test disposal
        componentInstance.dispose();
        assert(
          componentInstance.disposed,
          "Instance should be disposed after dispose()"
        );

        runtime.dispose();
      }
    );
  });

  test("Component template and state management", async () => {
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
        assert(homeComponentAdaptor, "Home component adaptor should exist");
        await homeComponentAdaptor.untilRetrieved();
        const homeComponent = homeComponentAdaptor.model;
        assert(homeComponent, "Home component should be loaded");

        const inputResolver = new StaticComponentInputResolver({
          environment: runtime.fragmentEnvironment,
          props: {},
        });

        const componentInstance = new ComponentInstance({
          model: homeComponent,
          inputResolver,
        });

        // Verify template and state observables
        assert(
          componentInstance.template$,
          "Component should have template observable"
        );
        assert(
          componentInstance.states$,
          "Component should have states observable"
        );
        assert(
          componentInstance.fragments$,
          "Component should have fragments observable"
        );

        // Test observables
        let templateReceived = false;
        let statesReceived = false;

        const templateSub = componentInstance.template$.subscribe(() => {
          templateReceived = true;
          // Template can be undefined, fragment, or expression
        });

        const statesSub = componentInstance.states$.subscribe((states) => {
          statesReceived = true;
          assert(Array.isArray(states), "States should be an array");
        });

        // Give observables a moment to emit
        await new Promise((resolve) => setTimeout(resolve, 10));

        assert(templateReceived, "Should receive template updates");
        assert(statesReceived, "Should receive states updates");

        templateSub.unsubscribe();
        statesSub.unsubscribe();
        componentInstance.dispose();
        runtime.dispose();
      }
    );
  });

  test("Component prop resolution", async () => {
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
        assert(homeComponentAdaptor, "Home component adaptor should exist");
        await homeComponentAdaptor.untilRetrieved();
        const homeComponent = homeComponentAdaptor.model;
        assert(homeComponent, "Home component should be loaded");

        // Create input resolver with test values
        const testProps = { title: "Test Title", count: 42 };
        const inputResolver = new StaticComponentInputResolver({
          environment: runtime.fragmentEnvironment,
          props: testProps,
        });

        const componentInstance = new ComponentInstance({
          model: homeComponent,
          inputResolver,
        });

        // Test props resolution through input resolver
        if (homeComponent.props && homeComponent.props.length > 0) {
          const firstProp = homeComponent.props[0];
          const propValue$ = componentInstance.propValue$(firstProp.name);

          assert(
            propValue$ !== undefined,
            "Prop value observable should exist"
          );

          const propSub = propValue$.subscribe(() => {
            // Value can be any type, just verify subscription works
          });

          await new Promise((resolve) => setTimeout(resolve, 10));
          // Note: prop might not have a value if not provided in testProps

          propSub.unsubscribe();
        }

        componentInstance.dispose();
        runtime.dispose();
      }
    );
  });
});
