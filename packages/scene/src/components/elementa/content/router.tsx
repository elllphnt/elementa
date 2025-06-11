import { JSX } from "react";
import { RouterRenderableContentRenderable } from "../../../renderables/_.js";

export function RouterRenderableContentComponent({
  content,
}: {
  content: RouterRenderableContentRenderable;
}): JSX.Element {
  return <div>Router: {content.key}</div>;
}
