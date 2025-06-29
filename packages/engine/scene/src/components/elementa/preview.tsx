import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX } from "react";
import { ElementaPreviewRenderable } from "../../renderables/_.js";
import { RenderableContentComponent } from "./content/_content.js";

export function ElementaPreviewComponent({
  preview,
}: {
  preview: ElementaPreviewRenderable;
}): JSX.Element {
  const content = useObservable(preview.content$, preview.content);
  if (!content) return <></>;
  return <RenderableContentComponent content={content} />;
}

export default ElementaPreviewComponent;
