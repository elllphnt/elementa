import {
  InMemoryInfrastructureData,
  makeFileUrl,
} from "@elllphnt/elementa-models";
import { clinicDashboardInfra } from "./infra.js";
import { appFile } from "./projects/files/app.js";

export type AppBundle = {
  appUrl: string;
  infra: InMemoryInfrastructureData;
};

export const clinicDashboardBundle: AppBundle = {
  appUrl: makeFileUrl({
    projectId: appFile.projectId,
    fileId: appFile.id,
  }),
  infra: clinicDashboardInfra,
};
