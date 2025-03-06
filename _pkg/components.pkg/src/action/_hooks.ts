import { useContext, useEffect } from "react";
import { ActionRegistryContext } from "./_contexts";
import { Action } from "./_model";

export function useActionRegistry() {
  const registry = useContext(ActionRegistryContext);
  if (!registry) throw new Error("ActionRegistryContext not found");

  return registry;
}

export function useAction(
  action: Omit<Action, "key">,
  dependencies: any[] = [],
) {
  const registry = useActionRegistry();

  useEffect(() => {
    const key = registry.registerAction(action);
    return () => {
      registry.unregisterAction(key);
    };
  }, [registry, ...dependencies]);
}
