import { JSX } from "react";
import { RenderableContentRenderable } from "../../../renderables/elementa/renderable_content/_create.js";
import { ComponentRenderableContentRenderable } from "../../../renderables/elementa/renderable_content/component.js";
import { FragmentRenderableContentRenderable } from "../../../renderables/elementa/renderable_content/fragment.js";
import { RouterRenderableContentRenderable } from "../../../renderables/elementa/renderable_content/router.js";
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
