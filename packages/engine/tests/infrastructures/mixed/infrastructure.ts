import type { TestInfrastructureData } from "~/infrastructure.js";
import { complexProjectData } from "../complex/complex/project.js";
import { stylingProjectData } from "../styling/styling/project.js";
import { mediaProjectData } from "../media/media/project.js";
import { statesProjectData } from "../states/states/project.js";

export const mixedInfrastructureData: TestInfrastructureData = {
  projects: [
    complexProjectData,
    stylingProjectData,
    mediaProjectData,
    statesProjectData,
  ],
};
