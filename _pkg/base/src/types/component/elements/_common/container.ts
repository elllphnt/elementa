import { ProviderData } from "../../../_.js";
import { ElementData } from "../element.js";

export type ElementContainerData = {
  content?: ElementData[];
  providers?: ProviderData[];
};
