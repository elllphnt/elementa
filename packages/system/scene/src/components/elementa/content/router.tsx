import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX } from "react";
import { RouterRenderableContentRenderable } from "../../../renderables/_.js";
import { RouterComponent } from "../../app/_.js";

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
