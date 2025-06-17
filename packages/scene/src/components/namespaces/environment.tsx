import { FragmentEnvironment } from "@elllphnt/elementa-runtime";
import { PropsWithChildren, memo, useEffect } from "react";
import { useNamespace } from "../../hooks/namespace.js";
import { PropsNamespaceProvider } from "./props.js";
import { StatesNamespaceProvider } from "./states/states.js";

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

export const FragmentEnvironmentNamespaceProvider = memo(function ({
  environment,
  data,
  children,
  root,
}: PropsWithChildren<{
  environment: FragmentEnvironment;
  data?: unknown;
  root?: boolean;
}>) {
  console.log({ environment });

  return (
    <PropsNamespaceProvider
      data={data}
      environment={environment}
      isolated={root}
    >
      <StatesNamespaceProvider environment={environment}>
        <EnvironmentNamespaceConsumer fragment={environment} />
        {children}
      </StatesNamespaceProvider>
    </PropsNamespaceProvider>
  );
});
