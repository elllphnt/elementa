import { useManyObservables, useObservable } from "@elllphnt/elementa-utils";
import { FragmentEnvironment, Namespace } from "@repo/elementa";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace";
import { useNamespace } from "../../hooks/namespace";

export function PropsNamespaceProvider({
  children,
  environment,
  data,
  isolated,
}: PropsWithChildren<{
  environment: FragmentEnvironment;
  data?: any;
  isolated?: boolean;
}>): JSX.Element {
  const upstreamNamespace = useNamespace();
  const downstreamNamespace = isolated
    ? new Namespace()
    : new Namespace(upstreamNamespace.content, upstreamNamespace.twoSlashMap);

  const props = useObservable(environment?.props$, environment?.props) ?? [];
  const propsKey = props.map((prop) => prop.key).join(".");

  const propIdentifiers = useManyObservables(
    props.map((prop) => prop.identifier$),
    props.map((prop) => prop.identifier),
    propsKey
  );
  const propValues = useManyObservables(
    props.map((prop) => environment.propValue$(prop)),
    props.map((prop) => environment.propValue(prop)),
    propsKey
  );

  const propResolvedValues = propValues.map((propValue) => {
    return upstreamNamespace.resolveValue(propValue);
  });
  propIdentifiers.forEach((identifier, index) => {
    const value = propResolvedValues[index];
    if (identifier !== undefined) {
      downstreamNamespace.set(["props", identifier], value);
      downstreamNamespace.setTwoSlash(
        `//prop:${props[index].id}`,
        `props.${identifier}`
      );
    }
  });

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      downstreamNamespace.set(["props", key], value);
    });
  }

  return (
    <NamespaceContext.Provider value={downstreamNamespace}>
      {/* {JSON.stringify({
        props: "props",
        upstream: upstreamNamespace.content.$,
        downstream: downstreamNamespace.content.$,
      })} */}
      {children}
    </NamespaceContext.Provider>
  );
}
