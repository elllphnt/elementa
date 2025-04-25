import { ContainerTool } from "./container";
import { FrameTool } from "./frame";
import { MediaTool } from "./media";
import { SelectTool } from "./select";
import { SlotTool } from "./slot";
import { TextTool } from "./text";
import { VectorTool } from "./vector";

export const tools = {
  Select: new SelectTool(),
  Frame: new FrameTool(),
  Text: new TextTool(),
  Vector: new VectorTool(),
  Media: new MediaTool(),
  Container: new ContainerTool(),
  ContainerFilled: new ContainerTool({ fill: true }),
  Slot: new SlotTool(),
};
