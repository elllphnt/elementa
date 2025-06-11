import { RenderingEnvironment } from "~/rendering/_.js";

export interface BaseRenderableContent<T extends string> {
  type: T;
  environment: RenderingEnvironment;
}
