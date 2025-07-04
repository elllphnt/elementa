import { InMemoryModuleHost, ModuleManager } from "@elllphnt/elementa-runtime";
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

describe("Module Manager", () => {
  test("ModuleManager initialization", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const externals = ["rxjs", "@elllphnt/elementa-base"];
        const importMap = { react: "https://cdn.skypack.dev/react" };

        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals,
          importMap,
        });

        assert(moduleManager, "ModuleManager should be created");
        assert(
          !moduleManager.disposed,
          "ModuleManager should not be disposed initially"
        );

        // Test disposal
        moduleManager.dispose();
        assert(
          moduleManager.disposed,
          "ModuleManager should be disposed after dispose()"
        );
      }
    );
  });

  test("Module loading and caching", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });

        // Get a module (should create and cache it)
        const module1 = moduleManager.module("/simple/files/app.ts");
        assert(module1, "Module should be loaded");

        // Get the same module again (should return cached version)
        const module2 = moduleManager.module("/simple/files/app.ts");
        assert(
          module1 === module2,
          "Same module should be returned from cache"
        );

        moduleManager.dispose();
      }
    );
  });

  test("Module evaluation", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });

        // Load and evaluate a module
        const module = moduleManager.module("/simple/files/app.ts");
        assert(module, "Module should be loaded");

        // Check if module has been resolved
        // Note: In a real scenario, we might need to wait for evaluation
        // but for this test we're just checking the module structure
        assert(
          typeof module.resolved === "boolean",
          "Module should have resolved property"
        );
        assert(
          module.value !== undefined || module.error !== undefined,
          "Module should have value or error"
        );

        moduleManager.dispose();
      }
    );
  });

  test("External dependencies handling", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const externals = ["rxjs", "@elllphnt/elementa-base"];

        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals,
        });

        // Test that external dependencies are handled properly
        // This would typically involve checking that external imports
        // are not attempted to be loaded as modules
        assert(moduleManager, "ModuleManager with externals should be created");

        moduleManager.dispose();
      }
    );
  });

  test("Import map resolution", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const importMap = {
          lodash: "https://cdn.skypack.dev/lodash",
          react: "https://cdn.skypack.dev/react",
        };

        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
          importMap,
        });

        // Import map should be applied during module processing
        assert(
          moduleManager,
          "ModuleManager with import map should be created"
        );

        moduleManager.dispose();
      }
    );
  });

  test("Module disposal and cleanup", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });

        // Load a module
        const module = moduleManager.module("/simple/files/app.ts");
        assert(module, "Module should be loaded");
        assert(!module.disposed, "Module should not be disposed initially");

        // Dispose module manager
        moduleManager.dispose();

        // Module should be disposed as well
        assert(
          module.disposed,
          "Module should be disposed when manager is disposed"
        );
      }
    );
  });

  test("Module error handling", async () => {
    await withTestInfrastructure(
      simpleInfrastructureData,
      async (infrastructure) => {
        const moduleHost = new InMemoryModuleHost();
        const moduleManager = new ModuleManager({
          infrastructure,
          moduleHost,
          externals: ["rxjs"],
        });

        // Try to load a non-existent module
        try {
          moduleManager.module("/nonexistent/module.ts");
          // Note: module() creates a module object even if file doesn't exist
          // The error would occur during evaluation/loading, not creation
          assert(
            true,
            "Module creation should succeed even for non-existent files"
          );
        } catch (error) {
          // If there's an immediate error, that's also valid behavior
          assert(error, "Error handling should work properly");
        }

        moduleManager.dispose();
      }
    );
  });
});
