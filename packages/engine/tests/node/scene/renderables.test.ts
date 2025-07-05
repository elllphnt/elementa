import { createElementInstance } from "@elllphnt/elementa-runtime";
import {
  InstanceRenderable,
  Renderable,
  type Scene,
} from "@elllphnt/elementa-scene";
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

describe("Renderable System", () => {
  test("Base Renderable functionality", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        class TestRenderable extends Renderable {
          constructor(scene: Scene) {
            super({ scene });
          }
        }

        const renderable = new TestRenderable(scene);
        renderable.initialize();

        // Test basic properties
        assert(
          renderable.scene === scene,
          "Renderable should have correct scene reference"
        );
        assert(
          typeof renderable.key === "string",
          "Renderable should have a key"
        );
        assert(
          renderable.disposed === false,
          "Renderable should not be disposed initially"
        );

        // Test HTML elements management
        assert(
          typeof renderable.htmlElements === "object",
          "Should have htmlElements object"
        );
        assert(
          Array.isArray(renderable.htmlElements) === false,
          "htmlElements should be an object, not array"
        );

        // Test flags management
        assert(
          typeof renderable.flags === "object",
          "Should have flags object"
        );

        // Test observables
        assert(
          typeof renderable.htmlElements$.subscribe === "function",
          "htmlElements$ should be observable"
        );
        assert(
          typeof renderable.flags$.subscribe === "function",
          "flags$ should be observable"
        );

        // Test disposal
        renderable.dispose();
        assert(renderable.disposed, "Renderable should be disposed");

        // Scene will be disposed automatically by withTestScene
      }
    );
  });

  test("HTML element management", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        class TestRenderable extends Renderable {
          constructor(scene: Scene) {
            super({ scene });
          }

          testSetElement(key: string, element: HTMLElement) {
            this.setHtmlElement(key, element);
          }

          testClearElement(key: string) {
            this.setHtmlElement(key, undefined);
          }
        }

        const renderable = new TestRenderable(scene);
        renderable.initialize();
        const testElement = document.createElement("div");
        const testKey = "test-key";

        // Test setting element
        renderable.testSetElement(testKey, testElement);
        assert(
          renderable.htmlElement(testKey) === testElement,
          "Should retrieve set element"
        );

        // Test observable updates
        let elementFromObservable: HTMLElement | undefined;
        const subscription = renderable
          .htmlElement$(testKey)
          .subscribe((element) => {
            elementFromObservable = element;
          });

        assert(
          elementFromObservable === testElement,
          "Observable should emit current element"
        );

        // Test clearing element
        renderable.testClearElement(testKey);
        assert(
          renderable.htmlElement(testKey) === undefined,
          "Should clear element"
        );
        assert(
          elementFromObservable === undefined,
          "Observable should emit undefined"
        );

        subscription.unsubscribe();
        renderable.dispose();

        // Scene will be disposed automatically by withTestScene
      }
    );
  });

  test("Instance Renderable functionality", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ runtime, infrastructure, scene }) => {
        const project = infrastructure.project("complex");
        assert(project, "Project should exist");

        await project.app.untilRetrieved();
        const app = project.app.model;
        assert(app, "App should be loaded");

        // Get a real element from the infrastructure
        const routerAdaptor = app.router;
        if (routerAdaptor) {
          await routerAdaptor.untilRetrieved();
          const router = routerAdaptor.model;
          assert(router, "Router should be loaded");

          // Get the first route as an example
          if (router.routes && router.routes.length > 0) {
            const route = router.routes[0];
            if (route.mainViewComponent) {
              await route.mainViewComponent.untilRetrieved();
              const component = route.mainViewComponent.model;
              if (component && component.template) {
                // Create an element instance from the template
                const elementInstance = createElementInstance({
                  element: component.template,
                  environment: runtime.fragmentEnvironment,
                });
                elementInstance.initialize();

                // Test InstanceRenderable with the element instance
                class TestInstanceRenderable extends InstanceRenderable<
                  typeof elementInstance
                > {
                  constructor(scene: Scene, instance: typeof elementInstance) {
                    super({ scene, instance });
                  }
                }

                const instanceRenderable = new TestInstanceRenderable(
                  scene,
                  elementInstance
                );
                instanceRenderable.initialize();

                assert(
                  instanceRenderable.instance === elementInstance,
                  "Should have correct instance reference"
                );
                assert(
                  instanceRenderable.scene === scene,
                  "Should have correct scene reference"
                );

                // Test disposal
                instanceRenderable.dispose();
                assert(
                  instanceRenderable.disposed,
                  "Instance renderable should be disposed"
                );

                elementInstance.dispose();
              }
            }
          }
        }

        // Scene will be disposed automatically by withTestScene
      }
    );
  });

  test("Renderable key uniqueness", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        class TestRenderable extends Renderable {
          constructor(scene: Scene) {
            super({ scene });
          }
        }

        const renderable1 = new TestRenderable(scene);
        const renderable2 = new TestRenderable(scene);
        const renderable3 = new TestRenderable(scene);
        renderable1.initialize();
        renderable2.initialize();
        renderable3.initialize();

        // Keys should be unique
        assert(
          renderable1.key !== renderable2.key,
          "Renderable keys should be unique"
        );
        assert(
          renderable2.key !== renderable3.key,
          "Renderable keys should be unique"
        );
        assert(
          renderable1.key !== renderable3.key,
          "Renderable keys should be unique"
        );

        renderable1.dispose();
        renderable2.dispose();
        renderable3.dispose();

        // Scene will be disposed automatically by withTestScene
      }
    );
  });

  test("Renderable flag management", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        class TestRenderable extends Renderable {
          constructor(scene: Scene) {
            super({ scene });
          }

          testSetFlag(key: string, value: boolean) {
            this.setFlag(key, value);
          }

          testClearFlag(key: string) {
            this.setFlag(key, false);
          }
        }

        const renderable = new TestRenderable(scene);
        renderable.initialize();

        // Test setting flags
        renderable.testSetFlag("test-flag", true);
        assert(
          renderable.flags["test-flag"] === true,
          "Should set flag to true"
        );

        renderable.testSetFlag("test-flag", false);
        assert(!renderable.flags["test-flag"], "Should set flag to false");

        // Test clearing flags
        renderable.testClearFlag("test-flag");
        assert(!renderable.flags["test-flag"], "Should clear flag");

        // Test flag observable
        let flagValue: boolean | undefined;
        const subscription = renderable.flags$.subscribe((flags) => {
          flagValue = flags["another-flag"];
        });

        renderable.testSetFlag("another-flag", true);
        assert(flagValue === true, "Flag observable should emit updated flags");

        subscription.unsubscribe();
        renderable.dispose();

        // Scene will be disposed automatically by withTestScene
      }
    );
  });
});
