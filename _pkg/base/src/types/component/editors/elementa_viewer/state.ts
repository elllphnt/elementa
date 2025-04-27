import { CornerData } from "../../../_";
import { RenderingContextData } from "../elementa/rendering_context";

export type ElementaViewerComponentData = RenderingContextData & {
  corners?: CornerData<number>;
};
