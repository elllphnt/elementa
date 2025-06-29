import { JSX } from "react";
import { FragmentRenderableContentRenderable } from "../../../renderables/_.js";

export function FragmentRenderableContentComponent({
  content,
}: {
  content: FragmentRenderableContentRenderable;
}): JSX.Element {
  return <div>fragment: {content.key}</div>;
}
