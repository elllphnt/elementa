import { FragmentEnvironment } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace";
import { useNamespace } from "../../hooks/namespace";
import { TransformerComponent } from "../transformers/transformer";

export function TransformersNamespaceProvider({
  children,
  environment,
}: PropsWithChildren<{
  environment: FragmentEnvironment;
}>): JSX.Element {
  const namespace = useNamespace({ clone: true });
  const transformers = useObservable(
    environment.transformers$,
    environment.transformers,
  );

  for (const transformer of transformers) {
    const key = "t_" + Math.random().toString(36).slice(2, 9);
    const value = (
      <TransformerComponent key={transformer.id} transformer={transformer} />
    );

    namespace.set(key, value);
    namespace.setTwoSlash(`//transformer:${transformer.id}`, key);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
