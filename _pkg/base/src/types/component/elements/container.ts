import { BaseElementData } from "./_base.js";
import { ElementContainerData } from "./_common/container.js";

export type ContainerElementData = BaseElementData &
  ElementContainerData & {
    type: "container";
  };
