import { useObservable } from "@elllphnt/elementa-react-utils";
import { InlineStateInstance } from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace.js";
import { useNamespace } from "../../../hooks/namespace.js";

function InnerInlineStateNamespaceProvider({
  state,
  script,
  varName,
  children,
}: PropsWithChildren<{
  state: InlineStateInstance;
  script: string;
  varName?: string;
}>) {
  const namespace = useNamespace({ clone: true });
  let value: unknown;

  try {
    const expression = `(()=>{${script}})()`;
    value = namespace.resolveExpression({
      __expression: expression,
    });
    console.log({ expression, value, varName });
  } catch (error) {
    console.error("Error executing inline script:", error);
  }

  namespace.set(state.namespaceKey, value);
  if (varName) {
    namespace.set([varName], value);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}

export function InlineStateNamespaceProvider({
  children,
  state,
}: PropsWithChildren<{
  state: InlineStateInstance;
}>) {
  const script = useObservable(state.model.script$, state.model.script);
  const varName = useObservable(state.model.varName$, state.model.varName);

  if (!script) {
    return <>{children}</>;
  } else {
    return (
      <InnerInlineStateNamespaceProvider
        key={script}
        script={script}
        varName={varName}
        state={state}
      >
        {children}
      </InnerInlineStateNamespaceProvider>
    );
  }
}
