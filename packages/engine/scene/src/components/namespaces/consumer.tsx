import { logger } from "@elllphnt/elementa-kernel";
import type { ElementRuntimeEnvironment } from "@elllphnt/elementa-runtime";
import { useEffect } from "react";
import { useNamespace } from "../../hooks/namespace.js";

export function EnvironmentNamespaceConsumer({
  environment,
}: {
  environment: ElementRuntimeEnvironment;
}) {
  logger.debug("Rendering EnvironmentNamespaceConsumer", { environment });

  const namespace = useNamespace();

  useEffect(() => {
    logger.debug(
      "EnvironmentNamespaceConsumer: Setting namespace on environment",
      {
        namespace,
        environment,
      }
    );
    environment.setNamespace(namespace);
  }, [namespace, environment]);

  return <></>;
}
