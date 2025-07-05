import { StaticTextCssStyleSheet } from "@elllphnt/elementa-models";
import { DomStyleSheetManager } from "@elllphnt/elementa-scene";
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

describe("Scene Style Management", () => {
  test("DomStyleSheetManager lifecycle", () => {
    const manager = new DomStyleSheetManager();
    manager.initialize();

    // Test basic properties
    assert(
      manager.disposed === false,
      "Manager should not be disposed initially"
    );
    assert(
      typeof manager.stylesheetAdaptors === "object",
      "Should have stylesheetAdaptors"
    );

    // Test disposal
    manager.dispose();
    assert(
      manager.disposed,
      "Manager should be disposed after calling dispose"
    );
  });

  test("Scene with stylesheet manager", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene, stylesheetManager }) => {
        // Test scene properties
        assert(
          scene.stylesheetDomManager === stylesheetManager,
          "Scene should have correct stylesheet manager"
        );
        assert(
          scene.disposed === false,
          "Scene should not be disposed initially"
        );

        // Scene and stylesheet manager will be disposed automatically by withTestScene
      }
    );
  });

  test("Stylesheet manager operations", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ stylesheetManager }) => {
        // Create a mock stylesheet for testing
        const stylesheet = new StaticTextCssStyleSheet({
          target: "test",
          text: "body { color: red; }",
        });
        stylesheet.initialize();

        // Test stylesheet adaptor creation
        const adaptor = stylesheetManager.stylesheetAdaptor(stylesheet);
        assert(adaptor, "Should create stylesheet adaptor");

        // Test that same stylesheet returns same adaptor
        const adaptor2 = stylesheetManager.stylesheetAdaptor(stylesheet);
        assert(adaptor === adaptor2, "Should reuse existing adaptor");

        stylesheet.dispose();
      }
    );
  });

  test("Scene initialization with system stylesheet", async () => {
    await withTestScene(
      {
        infrastructureData: complexInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ scene, stylesheetManager }) => {
        // Scene should initialize with system stylesheet
        // This test verifies the constructor doesn't throw and basic setup works
        assert(
          scene.stylesheetDomManager === stylesheetManager,
          "Should have manager reference"
        );

        // Scene and manager will be disposed automatically by withTestScene
      }
    );
  });
});
