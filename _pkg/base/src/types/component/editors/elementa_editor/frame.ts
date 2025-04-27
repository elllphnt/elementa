import { CornerData, IdentifiableData } from "../../../_";
import { RenderingContextData } from "../elementa/rendering_context";

export type ElementaFrameData = IdentifiableData &
  RenderingContextData & {
    name?: string;
    fragmentId?: string;
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    corners?: CornerData<number>;
  };
