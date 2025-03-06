import { map, of, switchMap } from "rxjs";
import { IElll } from "~/src/types/elll";
import { getElllElementaInfrastrcture } from "../infrastructure/_lib";
import { ElllElementaProject } from "./project";

export function getElllElementaProject({
  elll,
  driveId,
}: {
  elll: IElll;
  driveId: string;
}): ElllElementaProject {
  const configKey = `elementa.project.${driveId}`;
  let project = elll.config<ElllElementaProject>(configKey);
  if (!project) {
    const infrastructure = getElllElementaInfrastrcture({ elll });
    project = new ElllElementaProject({ infrastructure, driveId });
    infrastructure.elll.setConfig(configKey, project);
  }

  return project;
}

export function getElllWorkspaceElementaProject(elll: IElll) {
  const workspaceId = elll.repository?.workspaceId;
  return workspaceId
    ? getElllElementaProject({ elll, driveId: workspaceId })
    : undefined;
}
export function getElllWorkspaceElementaProject$(elll: IElll) {
  return elll.repository$.pipe(
    switchMap((repository) => repository?.workspaceId$ ?? of(undefined)),
    map((workspaceId) =>
      workspaceId
        ? getElllElementaProject({ elll, driveId: workspaceId })
        : undefined,
    ),
  );
}
