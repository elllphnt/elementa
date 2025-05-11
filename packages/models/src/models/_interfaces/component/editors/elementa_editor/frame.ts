import { CornerData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Identifiable } from "../../identifiable.js";
import { RenderableContent } from "../elementa/_.js";
import { RenderingContext } from "../elementa/rendering_context.js";
import { ElementaStage } from "./stage.js";

export interface ElementaFrame extends Identifiable {
  stage: ElementaStage;

  context: RenderingContext;
  content: RenderableContent;

  name: string | undefined;
  name$: Observable<string | undefined>;

  fragmentId: string | undefined;
  fragmentId$: Observable<string | undefined>;

  fragment: any;
  fragment$: Observable<any>;

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

  remove(): void;
}
