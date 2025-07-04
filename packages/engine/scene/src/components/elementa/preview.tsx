import { useObservable } from "@elllphnt/elementa-react-utils";
import type { JSX } from "react";
import type { ElementaPreviewRenderable } from "../../renderables/elementa/preview/preview.js";
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
