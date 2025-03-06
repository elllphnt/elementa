import { FragmentEnvironment } from "@repo/elementa";
import { useManyObservables, useObservable } from "@repo/utils";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace";
import { useNamespace } from "../../hooks/namespace";

export function ParamsNamespaceProvider({
  children,
  environment,
}: PropsWithChildren<{
  environment: FragmentEnvironment;
}>): JSX.Element {
  const namespace = useNamespace({ clone: true });

  const params = useObservable(environment?.params$, environment?.params) ?? [];
  const paramsKey = params.map((param) => param.key).join(".");

  const paramNames = useManyObservables(
    params.map((param) => param.name$),
    params.map((param) => param.name),
    paramsKey,
  );
  const paramValues = useManyObservables(
    params.map((param) => environment.paramValue$(param)),
    params.map((param) => environment.paramValue(param)),
    paramsKey,
  );

  const paramResolvedValues = paramValues.map((paramValue) => {
    return namespace.resolveValue(paramValue);
  });
  paramNames.forEach((name, index) => {
    const value = paramResolvedValues[index];
    if (name !== undefined) {
      namespace.set(["$", name], value);
      namespace.setTwoSlash(`//param:${params[index].key}`, `params.${name}`);
    }
  });

  return (
    <NamespaceContext.Provider value={namespace}>
      {/* {JSON.stringify({
        $: namespace.content.$,
        paramNames,
        paramValues,
        paramResolvedValues,
      })} */}

      {children}
    </NamespaceContext.Provider>
  );
}
