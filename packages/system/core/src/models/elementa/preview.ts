import { CornerData, CornerName } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { ElementaEnvironment } from "./environment.js";
import { RenderableContent } from "./renderable_content/_.js";
import { RenderingContext } from "./rendering_context.js";

export interface ElementaPreview {
  environment: ElementaEnvironment;
  context: RenderingContext;

  content: RenderableContent | undefined;
  content$: Observable<RenderableContent | undefined>;

  corners: CornerData<number> | undefined;
  corners$: Observable<CornerData<number> | undefined>;

  corner(name: CornerName): number | undefined;
  corner$(name: CornerName): Observable<number | undefined>;
}
