import { JSX } from "react";
import { AppRenderableContentRenderable } from "../../../renderables/_";

export function AppRenderableContentComponent({
  content,
}: {
  content: AppRenderableContentRenderable;
}): JSX.Element {
  return <div>app: {content.key}</div>;
}
