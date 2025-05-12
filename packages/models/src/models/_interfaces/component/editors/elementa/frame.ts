import { CornerData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Identifiable } from "../../../_shared/identifiable.js";
import { RenderableContent } from "../elementa/_.js";
import { RenderingContext } from "../elementa/rendering_context.js";
import { ElementaStage } from "./stage.js";

export interface ElementaFrame extends Identifiable {
  stage: ElementaStage;

  context: RenderingContext;

  content: RenderableContent | undefined;
  content$: Observable<RenderableContent | undefined>;

  name: string | undefined;
  name$: Observable<string | undefined>;

  x: number | undefined;
  x$: Observable<number | undefined>;

  y: number | undefined;
  y$: Observable<number | undefined>;

  height: number | undefined;
  height$: Observable<number | undefined>;

  width: number | undefined;
  width$: Observable<number | undefined>;

  corners: CornerData<number> | undefined;
  corners$: Observable<CornerData<number> | undefined>;

  setName(name: string | undefined): void;
  setX(x: number | undefined): void;
  setY(y: number | undefined): void;
  setHeight(height: number | undefined): void;
  setWidth(width: number | undefined): void;
  setCorners(corners: CornerData<number> | undefined): void;

  remove(): void;
}
