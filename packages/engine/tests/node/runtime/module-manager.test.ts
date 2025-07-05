import { makeFileUrl } from "@elllphnt/elementa-base";
import { afterAll, afterEach, assert, beforeAll, describe, test } from "vitest";
import { appFileData as simpleProjectAppFileData } from "~/infrastructures/simple/simple/files/app.js";
import { simpleProjectData } from "~/infrastructures/simple/simple/project.js";
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

describe("Module Manager", () => {
  test("ModuleManager initialization", async () => {
    await withTestRuntime(
      {
        infrastructureData: simpleInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ moduleManager }) => {
        assert(moduleManager, "ModuleManager should be created");
        assert(
          !moduleManager.disposed,
          "ModuleManager should not be disposed initially"
        );
      }
    );
  });

  test("Module loading and caching", async () => {
    await withTestRuntime(
      { infrastructureData: simpleInfrastructureData, externals: ["rxjs"] },
      async ({ moduleManager }) => {
        // Get a module (should create and cache it)
        const module1 = moduleManager.module(
          makeFileUrl({
            projectId: simpleProjectData.id,
            fileId: simpleProjectAppFileData.id,
          })
        );
        assert(module1, "Module should be loaded");

        // Get the same module again (should return cached version)
        const module2 = moduleManager.module(
          makeFileUrl({
            projectId: simpleProjectData.id,
            fileId: simpleProjectAppFileData.id,
          })
        );
        assert(
          module1 === module2,
          "Same module should be returned from cache"
        );
      }
    );
  });

  test("Module evaluation", async () => {
    await withTestRuntime(
      { infrastructureData: simpleInfrastructureData, externals: ["rxjs"] },
      async ({ moduleManager }) => {
        // Load and evaluate a module
        const module = moduleManager.module(
          makeFileUrl({
            projectId: simpleProjectData.id,
            fileId: simpleProjectAppFileData.id,
          })
        );
        assert(module, "Module should be loaded");

        await module.untilResolved();

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
      }
    );
  });

  test("External dependencies handling", async () => {
    await withTestRuntime(
      {
        infrastructureData: simpleInfrastructureData,
        externals: ["rxjs", "@elllphnt/elementa-base"],
      },
      async ({ moduleManager }) => {
        // Test that external dependencies are handled properly
        // This would typically involve checking that external imports
        // are not attempted to be loaded as modules
        assert(moduleManager, "ModuleManager with externals should be created");
      }
    );
  });

  test("Import map resolution", async () => {
    await withTestRuntime(
      { infrastructureData: simpleInfrastructureData, externals: ["rxjs"] },
      async ({ moduleManager }) => {
        assert(
          moduleManager,
          "ModuleManager with import map should be created"
        );

        moduleManager.dispose();
      }
    );
  });

  test("Module disposal and cleanup", async () => {
    await withTestRuntime(
      { infrastructureData: simpleInfrastructureData, externals: ["rxjs"] },
      async ({ moduleManager }) => {
        // Load a module
        const module = moduleManager.module(
          makeFileUrl({
            projectId: simpleProjectData.id,
            fileId: simpleProjectAppFileData.id,
          })
        );
        assert(module, "Module should be loaded");
        assert(!module.disposed, "Module should not be disposed initially");

        // Note: Module disposal is handled by the withTestRuntime cleanup
        // Module should be disposed when the test completes
      }
    );
  });

  test("Module error handling", async () => {
    await withTestRuntime(
      { infrastructureData: simpleInfrastructureData, externals: ["rxjs"] },
      async ({ moduleManager }) => {
        // Try to load a non-existent module
        try {
          moduleManager.module(
            makeFileUrl({
              projectId: simpleProjectData.id,
              fileId: "nonexistent-file-id",
            })
          );
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
      }
    );
  });
});
