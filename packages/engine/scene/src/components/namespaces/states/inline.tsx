import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { InlineStateInstance } from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace.js";
import { useNamespace } from "../../../hooks/namespace.js";
import { renderingLogger } from "../../../loggers.js";

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
  } catch (error) {
    logger.error(
      "InnerInlineStateNamespaceProvider: Error executing inline script",
      {
        error,
        script,
      }
    );
  }

  namespace.set(state.namespaceKey, value);
  if (varName) {
    namespace.set([varName], value);
  }

  renderingLogger.debug(
    `InnerInlineStateNamespaceProvider ${varName} (${state.model.id})`,
    {
      value,
      namespace,
      script,
      varName,
      state,
    }
  );

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

  renderingLogger.debug(
    `InlineStateNamespaceProvider ${varName} (${state.model.id})`,
    {
      state,
      script,
      varName,
    }
  );

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
