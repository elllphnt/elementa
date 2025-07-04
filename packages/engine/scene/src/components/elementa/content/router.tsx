import { useObservable } from "@elllphnt/elementa-react-utils";
import type { JSX } from "react";
import type { RouterRenderableContentRenderable } from "../../../renderables/elementa/renderable_content/router.js";
import RouterComponent from "../../app/app.js";

export function RouterRenderableContentComponent({
  content,
}: {
  content: RouterRenderableContentRenderable;
}): JSX.Element {
  const router = useObservable(content.routerContent$, content.routerContent);

  if (!router) {
    return <div>Router not found</div>;
  } else {
    return <RouterComponent router={router} />;
  }
}
