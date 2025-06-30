import { JSX } from "react";
import { FragmentRenderableContentRenderable } from "../../../renderables/elementa/renderable_content/fragment.js";

export function FragmentRenderableContentComponent({
  content,
}: {
  content: FragmentRenderableContentRenderable;
}): JSX.Element {
  return <div>fragment: {content.key}</div>;
}
