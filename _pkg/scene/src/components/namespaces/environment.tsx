import { FragmentEnvironment } from "@elllphnt/elementa-runtime";
import { PropsWithChildren, memo, useEffect } from "react";
import { useNamespace } from "../../hooks/namespace";
import { FragmentRenderable } from "../../renderables/fragment";
import { FragmentFragmentsNamespaceProvider } from "./fragments";
import { PropsNamespaceProvider } from "./props";
import { StatesNamespaceProvider } from "./states/states";

export function EnvironmentNamespaceConsumer({
  fragment,
}: {
  fragment: FragmentEnvironment;
}) {
  const namespace = useNamespace();

  useEffect(() => {
    fragment.setNamespace(namespace);
  }, [namespace, fragment]);

  return <></>;
}

export const FragmentNamespaceProvider = memo(function ({
  fragment,
  data,
  children,
  root,
}: PropsWithChildren<{
  fragment: FragmentRenderable;
  data?: unknown;
  root?: boolean;
}>) {
  const environment = fragment.instance.environment;

  if (root) {
    return (
      <PropsNamespaceProvider
        data={data}
        environment={environment}
        isolated={root}
      >
        <StatesNamespaceProvider environment={environment}>
          <FragmentFragmentsNamespaceProvider fragment={fragment}>
            <EnvironmentNamespaceConsumer fragment={environment} />
            {children}
          </FragmentFragmentsNamespaceProvider>
        </StatesNamespaceProvider>
      </PropsNamespaceProvider>
    );
  } else {
    return <>{children}</>;
  }
});
