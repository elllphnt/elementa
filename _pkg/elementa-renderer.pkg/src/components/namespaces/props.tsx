import { FragmentEnvironment } from "@repo/elementa";
import { useManyObservables, useObservable } from "@repo/utils";
import { PropsWithChildren, useMemo } from "react";
import { NamespaceContext } from "../../contexts/namespace";
import { useNamespace } from "../../hooks/namespace";
import { Namespace } from "@repo/elementa";

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
  const downstreamNamespace = useMemo(() => {
    if (isolated) {
      return new Namespace();
    } else {
      return new Namespace(
        upstreamNamespace.content,
        upstreamNamespace.twoSlashMap,
      );
    }
  }, []);

  const props = useObservable(environment?.props$, environment?.props) ?? [];
  const propsKey = props.map((prop) => prop.key).join(".");

  const propNames = useManyObservables(
    props.map((prop) => prop.name$),
    props.map((prop) => prop.name),
    propsKey,
  );
  const propValues = useManyObservables(
    props.map((prop) => environment.propValue$(prop)),
    props.map((prop) => environment.propValue(prop)),
    propsKey,
  );

  const propResolvedValues = propValues.map((propValue) => {
    return upstreamNamespace.resolveValue(propValue);
  });
  propNames.forEach((name, index) => {
    const value = propResolvedValues[index];
    if (name !== undefined) {
      downstreamNamespace.set(["props", name], value);
      downstreamNamespace.setTwoSlash(
        `//prop:${props[index].id}`,
        `props.${name}`,
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
