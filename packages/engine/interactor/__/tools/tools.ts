import { FrameTool } from "./frame.js";
import { SelectTool } from "./select.js";

export const tools = {
  Select: new SelectTool(),
  Frame: new FrameTool(),
  // Text: new TextTool(),
  // Vector: new VectorTool(),
  // Media: new MediaTool(),
  // Container: new ContainerTool(),
  // ContainerFilled: new ContainerTool({ fill: true }),
  // Slot: new SlotTool(),
};
