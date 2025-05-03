import {
  useManyObservables,
  useObservable,
} from "@elllphnt/elementa-react-utils";
import { FragmentEnvironment, Namespace } from "@elllphnt/elementa-runtime";
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
}>) {
  const upstreamNamespace = useNamespace();
  const downstreamNamespace = isolated
    ? new Namespace()
    : new Namespace(upstreamNamespace.content);

  const props = useObservable(environment?.props$, environment?.props) ?? [];
  const propsKey = props.map((prop) => prop.key).join(".");

  const propIdentifiers = useManyObservables(
    props.map((prop) => prop.varName$),
    props.map((prop) => prop.varName),
    propsKey
  );
  const propValues = useManyObservables(
    propIdentifiers.map((prop) =>
      prop ? environment.propValue$(prop) : undefined
    ),
    propIdentifiers.map((prop) =>
      prop ? environment.propValue(prop) : undefined
    ),
    propsKey
  );

  const propResolvedValues = propValues.map((propValue) => {
    return upstreamNamespace.resolveValue(propValue);
  });
  propIdentifiers.forEach((identifier, index) => {
    const value = propResolvedValues[index];
    if (identifier !== undefined) {
      downstreamNamespace.set(["props", identifier], value);
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
