import { FragmentEnvironment } from "@repo/elementa";
import { PropsWithChildren, memo, useEffect } from "react";
import { FragmentRenderable } from "~/src/renderables/instances/fragment";
import { useNamespace } from "../../hooks/namespace";
import { FragmentFragmentsNamespaceProvider } from "./fragments";
import { PropsNamespaceProvider } from "./props";
import { StatesNamespaceProvider } from "./states/states";

export function EnvironmentNamespaceConsumer({
  fragment,
}: {
  fragment: FragmentEnvironment;
}): JSX.Element {
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
  data?: any;
  root?: boolean;
}>): JSX.Element {
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
