import { useObservable } from "@elllphnt/elementa-react-utils";
import { FragmentElementRenderable } from "../../renderables/_.js";
import { FragmentComponent } from "../fragment/_.js";

export function FragmentElementComponent({
  element,
}: {
  element: FragmentElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const fragment = useObservable(element.fragment$, element.fragment);
  if (!fragment) return <></>;
  return <FragmentComponent fragment={fragment} />;
}
