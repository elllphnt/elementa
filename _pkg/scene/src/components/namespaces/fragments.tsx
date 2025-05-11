import { useObservable } from "@elllphnt/elementa-react-utils";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";
import { FragmentRenderable } from "../../renderables/fragment.js";
import { FragmentComponent } from "../fragment/fragment.js";

export function FragmentFragmentsNamespaceProvider({
  children,
  fragment,
}: PropsWithChildren<{
  fragment: FragmentRenderable;
}>) {
  const namespace = useNamespace({ clone: true });
  const fragments = useObservable(fragment.fragments$, fragment.fragments);

  for (const fragment of fragments) {
    const key = "n_" + Math.random().toString(36).slice(2, 9);
    const value = <FragmentComponent key={fragment.key} fragment={fragment} />;

    namespace.set(key, value);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
