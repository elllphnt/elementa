import { StaticTextCssStyleSheet } from "@elllphnt/elementa-models";
import { BehaviorSubject } from "rxjs";
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

describe("Scene Core Functionality", () => {
  test("Scene lifecycle and basic operations", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene, stylesheetManager }) => {
        // Test scene construction
        assert(
          scene.stylesheetDomManager === stylesheetManager,
          "Scene should have correct stylesheet manager"
        );
        assert(
          scene.disposed === false,
          "Scene should not be disposed initially"
        );

        // Note: Scene will be disposed automatically by withTestScene
        // So we can't test the disposal state directly here
      }
    );
  });

  test("Fragment registration and reference counting", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        // Create a mock fragment for testing
        const mockProject = {
          styleManager: {
            cssStylesheets$: new BehaviorSubject([]),
          },
        };

        const mockFragment = {
          id: "test-fragment",
          environment: { project: mockProject },
          allCssStylesheets$: new BehaviorSubject([]),
        } as any;

        // Test fragment registration
        scene.registerFragment(mockFragment);

        // Register the same fragment again (should increment ref count)
        scene.registerFragment(mockFragment);

        // Unregister once (should still be tracked due to ref counting)
        scene.unregisterFragment(mockFragment);

        // Unregister again (should be fully removed)
        scene.unregisterFragment(mockFragment);

        // Additional unregister should be safe (no-op)
        scene.unregisterFragment(mockFragment);

        // Scene will be disposed automatically by withTestScene
      }
    );
  });

  test("Stylesheet injection and cleanup", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        // Create a mock fragment with stylesheet
        const stylesheet = new StaticTextCssStyleSheet({
          target: "test",
          text: "body { color: red; }",
        });
        stylesheet.initialize();

        const mockProject = {
          styleManager: {
            cssStylesheets$: new BehaviorSubject([]),
          },
        };

        const mockFragment = {
          id: "test-fragment",
          environment: { project: mockProject },
          allCssStylesheets$: new BehaviorSubject([stylesheet]),
        } as any;

        // Register fragment (should inject stylesheets)
        scene.registerFragment(mockFragment);

        // Allow time for async stylesheet operations
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Unregister fragment (should remove stylesheets)
        scene.unregisterFragment(mockFragment);

        // Allow time for cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));

        stylesheet.dispose();
      }
    );
  });

  test("Multiple fragment management", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        const mockProject = {
          styleManager: {
            cssStylesheets$: new BehaviorSubject([]),
          },
        };

        // Create multiple mock fragments
        const fragments: any[] = [];
        for (let i = 0; i < 3; i++) {
          const mockFragment = {
            id: `test-fragment-${i}`,
            environment: { project: mockProject },
            allCssStylesheets$: new BehaviorSubject([]),
          } as any;
          fragments.push(mockFragment);
        }

        // Register all fragments
        fragments.forEach((fragment) => scene.registerFragment(fragment));

        // Unregister all fragments
        fragments.forEach((fragment) => scene.unregisterFragment(fragment));

        // Scene will be disposed automatically by withTestScene
      }
    );
  });

  test("Scene disposal cleanup", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene }) => {
        const mockProject = {
          styleManager: {
            cssStylesheets$: new BehaviorSubject([]),
          },
        };

        const mockFragment = {
          id: "test-fragment",
          environment: { project: mockProject },
          allCssStylesheets$: new BehaviorSubject([]),
        } as any;

        // Register fragment
        scene.registerFragment(mockFragment);

        // Dispose scene while fragments are still registered (manually to test cleanup)
        scene.dispose();

        // Scene should clean up all registrations
        assert(scene.disposed, "Scene should be disposed");

        // Scene will be disposed automatically by withTestScene as well (safe double disposal)
      }
    );
  });
});
