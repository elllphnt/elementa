import { JSX } from "react";
import {
  AppRenderableContentRenderable,
  ComponentRenderableContentRenderable,
  FragmentRenderableContentRenderable,
  RenderableContentRenderable,
} from "../../../renderables/_";
import { AppRenderableContentComponent } from "./app";
import { ComponentRenderableContentComponent } from "./component";
import { FragmentRenderableContentComponent } from "./fragment";

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
    case "app":
      return (
        <AppRenderableContentComponent
          content={content as AppRenderableContentRenderable}
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
