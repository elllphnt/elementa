import { ElementaEnvironment } from "../environment.js";

export interface BaseRenderableContent<T extends string> {
  type: T;
  environment: ElementaEnvironment;
}
