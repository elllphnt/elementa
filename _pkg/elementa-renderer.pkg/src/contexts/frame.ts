import { createContext } from "react";
import { FrameWidgetRenderable } from "../renderables/instances/_";

export const FrameContext = createContext<FrameWidgetRenderable | undefined>(
  undefined,
);
