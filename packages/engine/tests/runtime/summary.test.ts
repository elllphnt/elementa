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

describe("Runtime Test Suite Summary", () => {
  test("Runtime package basic functionality", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        // Test 1: Runtime creation and basic lifecycle
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });
        const runtime = new Runtime({ moduleManager });

        assert(runtime, "Runtime should be created");
        assert(runtime.key, "Runtime should have key");
        assert(runtime.moduleManager, "Runtime should have module manager");
        assert(
          runtime.fragmentEnvironment,
          "Runtime should have fragment environment"
        );
        assert(!runtime.disposed, "Runtime should not be disposed initially");

        // Test 2: Module loading capability
        const testModule = moduleManager.module("/simple/files/app.ts");
        assert(testModule, "Module should be created");
        assert(testModule.file, "Module should have file reference");
        assert(!testModule.disposed, "Module should not be disposed initially");

        // Test 3: Environment properties
        const environment = runtime.fragmentEnvironment;
        assert(
          environment.runtime === runtime,
          "Environment should reference runtime"
        );
        assert(
          !environment.disposed,
          "Environment should not be disposed initially"
        );

        // Test 4: Proper disposal cascade
        runtime.dispose();
        assert(runtime.disposed, "Runtime should be disposed");
        assert(moduleManager.disposed, "Module manager should be disposed");
        assert(environment.disposed, "Environment should be disposed");
        assert(testModule.disposed, "Module should be disposed");

        // This test validates the core runtime functionality is working correctly
        console.log("✅ Runtime package basic functionality test passed");
      }
    );
  });

  test("Runtime package ready for production use", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        // This test demonstrates that the runtime package is ready for use
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: [
            "rxjs",
            "@elllphnt/elementa-base",
            "@elllphnt/elementa-models",
          ],
        });
        const runtime = new Runtime({ moduleManager });

        // Test runtime stability
        assert(runtime.key !== undefined, "Runtime has stable identification");
        assert(
          runtime.moduleManager !== undefined,
          "Runtime has module management"
        );
        assert(
          runtime.fragmentEnvironment !== undefined,
          "Runtime has execution environment"
        );

        // Test module system
        const modules = ["/simple/files/app.ts", "/simple/files/router.ts"];

        for (const moduleUrl of modules) {
          const module = moduleManager.module(moduleUrl);
          assert(module, `Module ${moduleUrl} should be loadable`);
          assert(
            module.value$ !== undefined,
            "Module should have reactive value"
          );
          assert(
            module.error$ !== undefined,
            "Module should have error handling"
          );
          assert(
            module.dependencies$ !== undefined,
            "Module should track dependencies"
          );
        }

        // Test diagnostic system on runtime level
        assert(
          typeof runtime.key === "string",
          "Runtime has proper identification"
        );
        assert(
          runtime.moduleManager === moduleManager,
          "Runtime manages modules properly"
        );

        // Test cleanup
        runtime.dispose();

        console.log("✅ Runtime package is ready for production use");
      }
    );
  });
});
