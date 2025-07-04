import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { simpleInfrastructureData } from "../infrastructures/simple/instrastructure.js";
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

describe("Runtime Core", () => {
  test("Runtime initialization and lifecycle", async () => {
    await withTestRuntime(
      { infrastructureData: simpleInfrastructureData, externals: ["rxjs"] },
      async ({ runtime, moduleManager }) => {
        // Verify runtime properties
        assert(runtime.key, "Runtime should have a key");
        assert(
          runtime.moduleManager === moduleManager,
          "Module manager should be set"
        );
        assert(
          runtime.fragmentEnvironment,
          "Fragment environment should be initialized"
        );

        // Verify runtime is trackable lifecycle object
        assert(!runtime.disposed, "Runtime should not be disposed initially");
      }
    );
  });

  test("Runtime fragment environment initialization", async () => {
    await withTestRuntime(
      { infrastructureData: simpleInfrastructureData, externals: ["rxjs"] },
      async ({ runtime }) => {
        // Verify fragment environment is properly initialized
        const env = runtime.fragmentEnvironment;
        assert(env, "Fragment environment should exist");
        assert(env.runtime === runtime, "Environment should reference runtime");
      }
    );
  });

  test("Runtime disposal cascades to dependencies", async () => {
    await withTestRuntime(
      { infrastructureData: simpleInfrastructureData, externals: ["rxjs"] },
      async ({ runtime, moduleManager }) => {
        // Verify components are not disposed initially
        assert(
          !runtime.fragmentEnvironment.disposed,
          "Environment should not be disposed"
        );
        assert(
          !moduleManager.disposed,
          "Module manager should not be disposed"
        );

        // Dispose runtime
        runtime.dispose();

        // Verify disposal cascaded
        assert(
          runtime.fragmentEnvironment.disposed,
          "Environment should be disposed"
        );
        assert(moduleManager.disposed, "Module manager should be disposed");
      }
    );
  });
});
