import { AppRenderableContent } from "./app.js";
import { ComponentRenderableContent } from "./component.js";
import { FragmentRenderableContent } from "./fragment.js";

export type RenderableContent =
  | AppRenderableContent
  | ComponentRenderableContent
  | FragmentRenderableContent;
