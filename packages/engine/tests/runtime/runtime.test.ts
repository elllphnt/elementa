import {
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { simpleInfrastructureData } from "../infrastructures/simple/instrastructure.js";
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

describe("Runtime Core", () => {
  test("Runtime initialization and lifecycle", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        // Create module host and manager
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });

        // Create runtime
        const runtime = new Runtime({ moduleManager });

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

        // Test disposal
        runtime.dispose();
        assert(runtime.disposed, "Runtime should be disposed after dispose()");
      }
    );
  });

  test("Runtime fragment environment initialization", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });

        const runtime = new Runtime({ moduleManager });

        // Verify fragment environment is properly initialized
        const env = runtime.fragmentEnvironment;
        assert(env, "Fragment environment should exist");
        assert(env.runtime === runtime, "Environment should reference runtime");

        runtime.dispose();
      }
    );
  });

  test("Runtime disposal cascades to dependencies", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });

        const runtime = new Runtime({ moduleManager });

        // Verify components are not disposed initially
        assert(
          !runtime.fragmentEnvironment.disposed,
          "Environment should not be disposed"
        );
        assert(
          !runtime.moduleManager.disposed,
          "Module manager should not be disposed"
        );

        // Dispose runtime
        runtime.dispose();

        // Verify disposal cascaded
        assert(
          runtime.fragmentEnvironment.disposed,
          "Environment should be disposed"
        );
        assert(
          runtime.moduleManager.disposed,
          "Module manager should be disposed"
        );
      }
    );
  });
});
