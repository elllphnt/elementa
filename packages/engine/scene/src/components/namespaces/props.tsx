import {
  useManyObservables,
  useObservable,
} from "@elllphnt/elementa-react-utils";
import { ComponentInstance, Namespace } from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";

export function PropsNamespaceProvider({
  children,
  component,
}: PropsWithChildren<{
  component: ComponentInstance;
}>) {
  const upstreamNamespace = useNamespace();
  const downstreamNamespace = new Namespace();

  const props =
    useObservable(component.model.props$, component.model.props) ?? [];
  const propsKey = props.map((prop) => prop.key).join(".");

  const propIdentifiers = useManyObservables(
    props.map((prop) => prop.varName$),
    props.map((prop) => prop.varName),
    propsKey
  );
  const propValues = useManyObservables(
    propIdentifiers.map((prop) =>
      prop ? component.propValue$(prop) : undefined
    ),
    propIdentifiers.map((prop) =>
      prop ? component.propValue(prop) : undefined
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

  return (
    <NamespaceContext.Provider value={downstreamNamespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
