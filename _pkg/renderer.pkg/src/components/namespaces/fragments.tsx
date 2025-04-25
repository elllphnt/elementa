import { useObservable } from "@repo/utils";
import { PropsWithChildren } from "react";
import { FragmentRenderable } from "~/src/renderables/instances/fragment";
import { NamespaceContext } from "../../contexts/namespace";
import { useNamespace } from "../../hooks/namespace";
import { FragmentComponent } from "../fragment/fragment";

export function FragmentFragmentsNamespaceProvider({
  children,
  fragment,
}: PropsWithChildren<{
  fragment: FragmentRenderable;
}>): JSX.Element {
  const namespace = useNamespace({ clone: true });
  const fragments = useObservable(fragment.fragments$, fragment.fragments);

  for (const fragment of fragments) {
    const key = "n_" + Math.random().toString(36).slice(2, 9);
    const value = <FragmentComponent key={fragment.key} fragment={fragment} />;

    namespace.set(key, value);
    namespace.setTwoSlash(`//fragment:${fragment.entity.id}`, key);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
