import { CornerData, CornerName } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "../../../../../infrastructure/_.js";
import { RenderableContent } from "../elementa/_.js";
import { RenderingContext } from "../elementa/rendering_context.js";

export interface ElementaPreview {
  project: Project;

  context: RenderingContext;
  content: RenderableContent;

  corners: CornerData<number> | undefined;
  corners$: Observable<CornerData<number> | undefined>;

  corner(name: CornerName): number | undefined;
  corner$(name: CornerName): Observable<number | undefined>;
}
