import { InMemoryInfrastructureData } from "@elllphnt/elementa-models";
import { clinicDashboardProject } from "./projects/clinic_dashboard.js";
import { appFile } from "./projects/files/app.js";

export const clinicDashboardInfra: InMemoryInfrastructureData = {
  projects: [clinicDashboardProject],
  files: [appFile],
};
