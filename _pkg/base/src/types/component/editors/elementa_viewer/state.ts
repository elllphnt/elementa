import { CornerData } from "../../../_";
import { RenderingContextData } from "../elementa/rendering_context";

export type ElementaViewerComponentStateData = RenderingContextData & {
  corners?: CornerData<number>;
};
