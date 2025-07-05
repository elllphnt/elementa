import type { TestInfrastructureData } from "~/infrastructure.js";
import { statesProjectData } from "./states/project.js";

export const statesInfrastructureData: TestInfrastructureData = {
  projects: [statesProjectData],
};
