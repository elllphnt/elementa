import { logger } from "@elllphnt/elementa-kernel";
import {
  useManyObservables,
  useObservable,
} from "@elllphnt/elementa-react-utils";
import type { ComponentInstance} from "@elllphnt/elementa-runtime";
import { Namespace } from "@elllphnt/elementa-runtime";
import type { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";

export function PropsNamespaceProvider({
  children,
  component,
}: PropsWithChildren<{
  component: ComponentInstance;
}>) {
  logger.debug("Rendering PropsNamespaceProvider", {
    component,
    children,
  });
  const upstreamNamespace = useNamespace();
  const downstreamNamespace = new Namespace();

  const props =
    useObservable(component.model.props$, component.model.props) ?? [];
  const propsKey = props.map((prop) => prop.key).join(".");

  logger.debug("PropsNamespaceProvider: Props resolved", {
    props,
    propsKey,
    propsCount: props.length,
  });

  const propIdentifiers = useManyObservables(
    props.map((prop) => prop.varName$),
    props.map((prop) => prop.varName),
    propsKey
  );

  logger.debug("PropsNamespaceProvider: Prop identifiers resolved", {
    propIdentifiers,
  });

  const propValues = useManyObservables(
    propIdentifiers.map((prop) =>
      prop ? component.propValue$(prop) : undefined
    ),
    propIdentifiers.map((prop) =>
      prop ? component.propValue(prop) : undefined
    ),
    propsKey
  );

  logger.debug("PropsNamespaceProvider: Prop values resolved", {
    propValues,
  });

  const propResolvedValues = propValues.map((propValue) => {
    const resolved = upstreamNamespace.resolveValue(propValue);
    logger.debug("PropsNamespaceProvider: Resolving prop value", {
      propValue,
      resolved,
    });
    return resolved;
  });

  propIdentifiers.forEach((identifier, index) => {
    const value = propResolvedValues[index];
    if (identifier !== undefined) {
      logger.debug("PropsNamespaceProvider: Setting prop in namespace", {
        identifier,
        value,
        path: ["props", identifier],
      });
      downstreamNamespace.set(["props", identifier], value);
    }
  });

  logger.debug("PropsNamespaceProvider: Namespace setup complete", {
    downstreamNamespace,
  });

  return (
    <NamespaceContext.Provider value={downstreamNamespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
