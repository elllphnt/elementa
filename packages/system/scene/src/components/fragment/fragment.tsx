import { useObservable } from "@elllphnt/elementa-react-utils";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";
import { FragmentRenderable } from "../../renderables/fragment.js";
import ElementComponent from "../elements/element.js";

function RecursionAlert({ fragment }: { fragment: FragmentRenderable }) {
  const name = useObservable(
    fragment.instance.model.name$,
    fragment.instance.model.name
  );

  return (
    <div
      style={{
        backgroundColor: "#ff0000aa",
        color: "white",
        padding: "0.5rem",
        fontSize: "10px",
        height: "100%",
        width: "100%",
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >
      <p style={{ fontWeight: "bold" }}>
        Recursive fragment detected: {name || fragment.instance.model.id}
      </p>
      <br />
      <div style={{ opacity: 0.8 }}>
        <p>
          This fragment is attempting to render itself, which will cause an
          infinite loop.
        </p>
        <p>Name: {name || "No name"}</p>
        <p>ID: {fragment.instance.model.id}</p>
      </div>
    </div>
  );
}

export function FragmentComponent({
  fragment,
  params,
}: {
  fragment: FragmentRenderable;
  params: Record<string, any>;
}) {
  const namespace = useNamespace({ clone: true });
  const content = useObservable(fragment.content$, fragment.content);

  if (fragment.instance.recursive) {
    return <RecursionAlert fragment={fragment} />;
  }

  for (const [key, value] of Object.entries(params)) {
    namespace.set(key, value);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {content.map((element) => (
        <ElementComponent key={element.key} element={element} />
      ))}
    </NamespaceContext.Provider>
  );
}
