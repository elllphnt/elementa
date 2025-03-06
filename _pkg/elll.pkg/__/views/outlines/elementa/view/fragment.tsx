import { FragmentHandle } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { ElementOutline } from "./elements/element";

export function FragmentOutline({
  fragment,
  stateKey,
}: {
  fragment: FragmentHandle;
  stateKey: string[];
}) {
  const content = useObservable(fragment.content$, fragment.content);
  return (
    <>
      {content.map((element) => (
        <ElementOutline
          key={element.key}
          element={element}
          stateKey={[...stateKey, "content", `${element.key}`]}
        />
      ))}
    </>
  );
}
