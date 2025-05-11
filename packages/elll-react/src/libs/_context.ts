import { Dependency } from "../types/dependency.js";
import { TranspilerReference } from "../types/reference.js";
import { TranspilerContext } from "../types/transpiler.js";

let dependencyKey = 0;
let referenceKey = 0;

export function createTranspilerContext(): TranspilerContext {
  const dependencies: Map<string, Dependency> = new Map();
  const references: Map<string, TranspilerReference> = new Map();

  return {
    useDependency({ url, specifier, name }) {
      let dependency = dependencies.get(url);

      if (dependency) {
        return dependency;
      } else {
        const key = dependencyKey++;
        dependency = {
          key,
          url,
          specifier,
          name,
        };
        dependencies.set(url, dependency);
        return dependency;
      }
    },
    getDependencies() {
      return Array.from(dependencies.values());
    },
    useReference(reference) {
      const mapKey = JSON.stringify(reference.__reference);
      let tReference = references.get(mapKey);
      if (tReference) {
        return tReference;
      } else {
        const key = referenceKey++;
        tReference = {
          key,
          data: reference.__reference,
        };
        references.set(mapKey, tReference);
        return tReference;
      }
    },
    getReferences() {
      return Array.from(references.values());
    },
  };
}
