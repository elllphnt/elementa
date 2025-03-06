import { TreeIndent, elllIcons16 } from "@repo/components";
import {
  ArrayElementHandle,
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
import { HandleOutlineEntry, useHandleOpenState } from "../handle";

export function ArrayElementOutline({
  element,
  stateKey = [],
}: {
  element: ArrayElementHandle;
  stateKey?: string[];
}) {
  const items = useObservable(element.items$, element.items) as any[];
  const [open, setOpen] = useHandleOpenState(element);

  return (
    <>
      <HandleOutlineEntry
        handle={element}
        container={!!items.length}
        open={open}
        setOpen={setOpen}
        icon={elllIcons16.wrap}
        fallbackName="Array"
      />

      {open ? (
        <TreeIndent>
          {items.map((item) => (
            <ElementOutline
              key={item.key}
              element={item}
              stateKey={[...stateKey, "item", `${item.key}`]}
            />
          ))}
        </TreeIndent>
      ) : null}
    </>
  );
}
export function VectorElementOutline({
  element,
}: {
  element: VectorElementHandle;
  stateKey?: string[];
}) {
  return (
    <HandleOutlineEntry
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
    <HandleOutlineEntry
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
  const [open, setOpen] = useHandleOpenState(element);
  const componentName = useObservable(
    element.entity.componentName$,
    element.entity.componentName,
  );

  return (
    <>
      <HandleOutlineEntry
        handle={element}
        icon={elllIcons16.component}
        fallbackName={componentName || "Component"}
        container={children.length > 0}
        open={open}
        setOpen={setOpen}
      />
      {open ? (
        <TreeIndent>
          {children.map((child) => (
            <ElementOutline
              key={child.key}
              element={child}
              stateKey={[...stateKey, "children", `${child.id}`]}
            />
          ))}
        </TreeIndent>
      ) : null}
    </>
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
    <HandleOutlineEntry
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
  const [open, setOpen] = useHandleOpenState(element);
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
    <>
      <HandleOutlineEntry
        handle={element}
        container={children.length > 0}
        open={open}
        setOpen={setOpen}
        icon={icon}
        fallbackName={fallbackName}
      />

      {open ? (
        <TreeIndent>
          {children.map((child) => (
            <ElementOutline
              key={child.key}
              element={child}
              stateKey={[...stateKey, "children", `${child.id}`]}
            />
          ))}
        </TreeIndent>
      ) : null}
    </>
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
  const [open, setOpen] = useHandleOpenState(element);
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
    <>
      <HandleOutlineEntry
        handle={element}
        container={children.length > 0}
        open={open}
        setOpen={setOpen}
        icon={icon}
        fallbackName={fallbackName}
      />

      {open ? (
        <TreeIndent>
          {children.map((child) => (
            <ElementOutline
              key={child.key}
              element={child}
              stateKey={[...stateKey, "children", `${child.id}`]}
            />
          ))}
        </TreeIndent>
      ) : null}
    </>
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
          element={child}
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
    [entityTypes.elements.array]: () => (
      <ArrayElementOutline
        element={element as ArrayElementHandle}
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
