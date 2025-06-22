import { ComponentRenderableContent } from "./component.js";
import { FragmentRenderableContent } from "./fragment.js";
import { RouterRenderableContent } from "./router.js";

export type RenderableContent =
  | RouterRenderableContent
  | ComponentRenderableContent
  | FragmentRenderableContent;
