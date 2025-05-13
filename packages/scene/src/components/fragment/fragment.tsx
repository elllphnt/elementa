import { useObservable } from "@elllphnt/elementa-react-utils";
import { SlotsContext } from "../../contexts/slot.js";
import { FragmentRenderable } from "../../renderables/fragment.js";
import { SlotRenderable } from "../../renderables/slot.js";
import ElementComponent from "../elements/element.js";
import { FragmentNamespaceProvider } from "../namespaces/environment.js";

function RecursionAlert({
  fragment,
  url,
}: {
  fragment: FragmentRenderable;
  url: string;
}) {
  const component =
    fragment.instance.model.component.file.project.infrastructure.component(
      url
    );
  const name = useObservable(component?.file.name$, component.file?.name);

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
        Recursive component detected: {name || "Unnamed component"}
      </p>
      <br />
      <div style={{ opacity: 0.8 }}>
        <p>
          This component is attempting to render itself, which will cause an
          infinite loop.
        </p>
        <p>URL: {url}</p>
      </div>
    </div>
  );
}

export function FragmentComponent({
  fragment,
  isolated,
  onRef,
}: {
  fragment: FragmentRenderable;
  isolated?: boolean;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const slots = useObservable(fragment.slots$, fragment.slots);
  const content = useObservable(fragment.content$, fragment.content);
  const recursion = useObservable(
    fragment.instance.recursion$,
    fragment.instance.recursion
  );

  if (recursion) {
    return <RecursionAlert fragment={fragment} url={recursion} />;
  }

  const slotMap = slots.reduce((map, slot) => {
    map[slot.instance.slotId] = slot;
    return map;
  }, {} as Record<string, SlotRenderable>);

  let jsxContent = <></>;

  if (content.length === 1) {
    const element = content[0];
    jsxContent = (
      <ElementComponent key={element.key} element={element} onRef={onRef} />
    );
  } else {
    jsxContent = (
      <>
        {content.map((element) => (
          <ElementComponent
            key={element.key}
            element={element}
            onRef={(e, key) =>
              onRef?.(e, [element.key, key].filter(Boolean).join(":"))
            }
          />
        ))}
      </>
    );
  }

  return (
    <FragmentNamespaceProvider fragment={fragment} root={isolated}>
      <SlotsContext.Provider value={slotMap}>
        {jsxContent}
      </SlotsContext.Provider>
    </FragmentNamespaceProvider>
  );
}
