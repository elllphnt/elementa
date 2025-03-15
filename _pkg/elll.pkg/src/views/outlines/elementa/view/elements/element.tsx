import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { elllIcons16 } from "@repo/components";
import {
  ComponentElementHandle,
  ContainerElementHandle,
  ElementHandle,
  MediaElementHandle,
  PageElementHandle,
  SlotElementHandle,
  TextElementHandle,
  VectorElementHandle,
} from "@repo/elementa-interactor";
import { useObservable } from "@repo/utils";
import { EntityHandleOutlineEntry, useEntityHandleOpenState } from "../handle";

export function VectorElementOutline({
  element,
}: {
  element: VectorElementHandle;
  stateKey?: string[];
}) {
  return (
    <EntityHandleOutlineEntry
      handle={element}
      icon={elllIcons16.vector}
      fallbackName="Vector"
    />
  );
}
export function MediaElementOutline({
  element,
}: {
  element: MediaElementHandle;
  stateKey?: string[];
}) {
  return (
    <EntityHandleOutlineEntry
      handle={element}
      icon={elllIcons16.image}
      fallbackName="Media"
    />
  );
}
export function ComponentElementOutline({
  element,
  stateKey = [],
}: {
  element: ComponentElementHandle;
  stateKey?: string[];
}) {
  const children = useObservable(element.children$, element.children);
  const [open, setOpen] = useEntityHandleOpenState(element);
  const componentName = useObservable(
    element.entity.componentName$,
    element.entity.componentName,
  );

  console.log("ComponentElementOutline", element.entity);

  return (
    <EntityHandleOutlineEntry
      handle={element}
      icon={elllIcons16.component}
      fallbackName={componentName || "Component"}
      container={children.length > 0}
      content={() => (
        <>
          {children.map((child) => (
            <ElementOutline
              key={child.key}
              element={child as ElementHandle}
              stateKey={[...stateKey, "children", `${child.id}`]}
            />
          ))}
        </>
      )}
    />
  );
}
export function TextElementOutline({
  element,
}: {
  element: TextElementHandle;
  stateKey?: string[];
}) {
  const text = useObservable(element.entity.text$, element.entity.text);

  return (
    <EntityHandleOutlineEntry
      handle={element}
      icon={elllIcons16.text}
      fallbackName={text || "Text"}
    />
  );
}
export function ContainerElementOutline({
  element,
  stateKey = [],
}: {
  element: ContainerElementHandle;
  stateKey?: string[];
}) {
  const children = useObservable(element.children$, element.children);
  const [open, setOpen] = useEntityHandleOpenState(element);
  const style = element.style;
  const layout = useObservable(
    style.resolvedPropertyValue$("display"),
    style.resolvedPropertyValue("display"),
  );
  const flow = useObservable(
    style.resolvedPropertyValue$("flex-direction"),
    style.resolvedPropertyValue("flex-direction"),
  );

  let icon = elllIcons16.container;
  let fallbackName = "Container";

  if (children.length === 1) {
    icon = elllIcons16.container;
    fallbackName = "Container";
  } else if (children.length) {
    if (layout === "flex") {
      if (flow === "row") {
        icon = elllIcons16.row;
        fallbackName = "Row";
      } else if (flow === "column") {
        icon = elllIcons16.column;
        fallbackName = "Column";
      }
    }
    if (layout === "grid") {
      icon = elllIcons16.grid;
      fallbackName = "Grid";
    }
  } else {
    fallbackName = "Box";
    icon = elllIcons16.container;
  }

  return (
    <EntityHandleOutlineEntry
      handle={element}
      container={children.length > 0}
      icon={icon}
      fallbackName={fallbackName}
      content={() => (
        <>
          {children.map((child) => (
            <ElementOutline
              key={child.key}
              element={child as ElementHandle}
              stateKey={[...stateKey, "children", `${child.id}`]}
            />
          ))}
        </>
      )}
    />
  );
}
export function SlotElementOutline({
  element,
  stateKey = [],
}: {
  element: SlotElementHandle;
  stateKey?: string[];
}) {
  const children = useObservable(element.children$, element.children);
  const [open, setOpen] = useEntityHandleOpenState(element);
  const style = element.style;
  const layout = useObservable(
    style.resolvedPropertyValue$("display"),
    style.resolvedPropertyValue("display"),
  );
  const flow = useObservable(
    style.resolvedPropertyValue$("flex-direction"),
    style.resolvedPropertyValue("flex-direction"),
  );

  let icon = elllIcons16.allCorner;
  let fallbackName = "Slot";

  return (
    <EntityHandleOutlineEntry
      handle={element}
      container={children.length > 0}
      icon={icon}
      fallbackName={fallbackName}
      content={() => (
        <>
          {children.map((child) => (
            <ElementOutline
              key={child.key}
              element={child as ElementHandle}
              stateKey={[...stateKey, "children", `${child.id}`]}
            />
          ))}
        </>
      )}
    />
  );
}
export function PageElementOutline({
  element,
  stateKey = [],
}: {
  element: PageElementHandle;
  stateKey?: string[];
}) {
  const children = useObservable(element.children$, element.children);
  return (
    <>
      {children.map((child) => (
        <ElementOutline
          key={child.key}
          element={child as ElementHandle}
          stateKey={[...stateKey, "children", `${child.id}`]}
        />
      ))}
    </>
  );
}
export function ElementOutline({
  element,
  stateKey,
}: {
  element: ElementHandle;
  stateKey?: string[];
}) {
  return switchEntityType(element.entity.type, {
    [entityTypes.elements.component]: () => (
      <ComponentElementOutline
        element={element as ComponentElementHandle}
        stateKey={stateKey}
      />
    ),
    [entityTypes.elements.container]: () => (
      <ContainerElementOutline
        element={element as ContainerElementHandle}
        stateKey={stateKey}
      />
    ),
    [entityTypes.elements.slot]: () => (
      <SlotElementOutline
        element={element as SlotElementHandle}
        stateKey={stateKey}
      />
    ),
    [entityTypes.elements.media]: () => (
      <MediaElementOutline
        element={element as MediaElementHandle}
        stateKey={stateKey}
      />
    ),
    [entityTypes.elements.text]: () => (
      <TextElementOutline
        element={element as TextElementHandle}
        stateKey={stateKey}
      />
    ),
    [entityTypes.elements.vector]: () => (
      <VectorElementOutline
        element={element as VectorElementHandle}
        stateKey={stateKey}
      />
    ),
    [entityTypes.elements.page]: () => (
      <PageElementOutline
        element={element as PageElementHandle}
        stateKey={stateKey}
      />
    ),
  });
}
