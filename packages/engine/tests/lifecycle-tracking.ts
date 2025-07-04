import { Lifecycle } from "@elllphnt/elementa-kernel";
import { assert } from "vitest";
import {
  TestInfrastructure,
  type TestInfrastructureData,
} from "./infrastructure.js";

/**
 * Helper function to format lifecycle instance info with stack trace
 */
function formatLifecycleInfo(
  instance: Lifecycle,
  includeFullStack = false
): string {
  const basicInfo = `${instance.constructor.name}(${instance.key})`;

  if (!instance.stack) {
    return basicInfo;
  }

  if (includeFullStack) {
    const stackLines = instance.stack.sanitized
      .split("\n")
      .map((line) => `      ${line}`)
      .join("\n");
    // eslint-disable-next-line no-constant-condition
    if (0) {
      return `${basicInfo}`;
    } else {
      return `${basicInfo}\n    Created at:\n${stackLines}`;
    }
  } else {
    // Just show the first meaningful line
    const firstLine = instance.stack.sanitized.split("\n")[0]?.trim();
    return firstLine ? `${basicInfo} (${firstLine})` : basicInfo;
  }
}

/**
 * Sets up lifecycle tracking for tests to ensure all lifecycle objects
 * are properly initialized and disposed.
 */
export function setupLifecycleTracking() {
  // Enable tracking before tests
  Lifecycle.track = true;

  // Clear any existing instances
  Lifecycle.instances.clear();

  console.log("✅ Lifecycle tracking enabled for tests");
}

/**
 * Validates that all tracked lifecycle instances have been properly
 * initialized and disposed after a test.
 */
export function validateLifecycleCleanup() {
  const instances = Array.from(Lifecycle.instances);

  // Check that all instances are initialized
  const uninitializedInstances = instances.filter(
    (instance) => !instance.initialized
  );
  if (uninitializedInstances.length > 0) {
    const details = uninitializedInstances.map((i) =>
      formatLifecycleInfo(i, true)
    );
    assert.fail(
      `❌ BUG: Found ${
        uninitializedInstances.length
      } uninitialized lifecycle instances:\n${details.join("\n\n")}`
    );
  }

  // Check that all instances are disposed
  const undisposedInstances = instances.filter(
    (instance) => !instance.disposed
  );
  if (undisposedInstances.length > 0) {
    const details = undisposedInstances.map((i) =>
      formatLifecycleInfo(i, true)
    );
    assert.fail(
      `❌ BUG: Found ${
        undisposedInstances.length
      } undisposed lifecycle instances. Tests must dispose all lifecycle objects they create.\n\nUndisposed instances:\n${details.join(
        "\n\n"
      )}`
    );
  }

  // Success! All instances are properly managed
  if (instances.length > 0) {
    console.log(
      `✅ All ${instances.length} lifecycle instances properly initialized and disposed`
    );
  } else {
    console.log(
      "✅ No lifecycle instances tracked (test may not have created any)"
    );
  }

  // Clear instances for next test
  Lifecycle.instances.clear();
}

/**
 * Cleans up lifecycle tracking after tests are complete.
 */
export function teardownLifecycleTracking() {
  // Disable tracking
  Lifecycle.track = false;

  // Clear instances
  Lifecycle.instances.clear();

  console.log("✅ Lifecycle tracking disabled and cleaned up");
}

/**
 * Emergency cleanup function that forcibly disposes all tracked lifecycle instances.
 * This should only be used in exceptional cases (like test setup failures) and indicates a bug.
 * Normal tests should dispose their own lifecycle objects.
 */
export function emergencyDisposeAllTrackedInstances() {
  const instances = Array.from(Lifecycle.instances);

  if (instances.length === 0) {
    return;
  }

  console.warn(
    `⚠️ EMERGENCY: Force disposing ${instances.length} lifecycle instances - this indicates a test bug!`
  );

  let disposedCount = 0;
  let errorCount = 0;

  for (const instance of instances) {
    if (!instance.disposed) {
      try {
        instance.dispose();
        disposedCount++;
        console.warn(`🔧 Emergency disposed: ${formatLifecycleInfo(instance)}`);
      } catch (error) {
        errorCount++;
        console.error(
          `❌ Failed to emergency dispose ${formatLifecycleInfo(instance)}:`,
          error
        );
      }
    }
  }

  if (errorCount === 0) {
    console.warn(`⚠️ Emergency disposal completed: ${disposedCount} instances`);
  } else {
    console.error(
      `❌ Emergency disposal partial failure: ${disposedCount} disposed, ${errorCount} failed`
    );
  }

  Lifecycle.instances.clear();
}

/**
 * Helper function that creates a test infrastructure, runs a test function,
 * and ensures proper cleanup of the infrastructure.
 *
 * @param data - The infrastructure data
 * @param testFn - The test function that receives the initialized infrastructure
 */
export async function withTestInfrastructure<T>(
  data: TestInfrastructureData,
  testFn: (infrastructure: TestInfrastructure) => Promise<T>
): Promise<T> {
  const infrastructure = new TestInfrastructure({ data });
  infrastructure.initialize();

  try {
    const result = await testFn(infrastructure);
    return result;
  } finally {
    infrastructure.dispose();
  }
}
