import { JSX } from "react";
import {
  ComponentRenderableContentRenderable,
  FragmentRenderableContentRenderable,
  RenderableContentRenderable,
  RouterRenderableContentRenderable,
} from "../../../renderables/_.js";
import { ComponentRenderableContentComponent } from "./component.js";
import { FragmentRenderableContentComponent } from "./fragment.js";
import { RouterRenderableContentComponent } from "./router.js";

export function RenderableContentComponent({
  content,
}: {
  content: RenderableContentRenderable;
}): JSX.Element {
  switch (content.instance.model.type) {
    case "component":
      return (
        <ComponentRenderableContentComponent
          content={content as ComponentRenderableContentRenderable}
        />
      );
    case "router":
      return (
        <RouterRenderableContentComponent
          content={content as RouterRenderableContentRenderable}
        />
      );
    case "fragment":
      return (
        <FragmentRenderableContentComponent
          content={content as FragmentRenderableContentRenderable}
        />
      );
  }
}
