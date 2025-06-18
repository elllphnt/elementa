import { ElementRuntimeEnvironment } from "@elllphnt/elementa-runtime";
import { useEffect } from "react";
import { useNamespace } from "../../hooks/namespace.js";

export function EnvironmentNamespaceConsumer({
  environment,
}: {
  environment: ElementRuntimeEnvironment;
}) {
  const namespace = useNamespace();

  useEffect(() => {
    environment.setNamespace(namespace);
  }, [namespace, environment]);

  return <></>;
}
