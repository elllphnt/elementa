import { useObservable } from "@elllphnt/elementa-react-utils";
import type { FragmentHandle } from "~/handles/renderables/fragment.js";
import { ElementHandleComponent } from "./elements/element.js";

export function FragmentHandleComponent({
  fragment,
}: {
  fragment: FragmentHandle;
}) {
  const content = useObservable(fragment.content$, fragment.content);

  return (
    <>
      {content.map((child) => (
        <ElementHandleComponent key={child.key} element={child} />
      ))}
    </>
  );
}
