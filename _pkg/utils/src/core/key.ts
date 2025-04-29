/**
 * KeyManager provides a centralized and namespaced key generator
 * for runtime objects in the Elementa VM.
 *
 * Each resource type (e.g., "component", "fragment", "state") gets its own
 * auto-incremented counter. All keys are prefixed with the resource name and
 * a shared random seed, ensuring clarity and traceability.
 */

class KeyManager {
  private seed: number;
  private counters: Map<string, number>;

  constructor() {
    this.seed = Math.floor(Math.random() * 1000);
    this.counters = new Map();
  }

  /**
   * Returns a globally unique key for a given resource type.
   * Example: "component-731-4"
   */
  next(resource: string): string {
    const count = this.counters.get(resource) ?? 0;
    this.counters.set(resource, count + 1);
    return `${resource}-${this.seed}-${count}`;
  }

  /**
   * Optional reset method for testing or isolated environments.
   */
  reset(): void {
    this.seed = Math.floor(Math.random() * 1000);
    this.counters.clear();
  }
}

// Singleton instance
export const keyManager = new KeyManager();
