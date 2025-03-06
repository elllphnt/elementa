import { useObservable } from "@repo/utils";
import {
  getElllWorkspaceElementaProject,
  getElllWorkspaceElementaProject$,
} from "~/src/modules/elementa/project/_lib";
import { useElll } from "../elll/elll";

export function useElllProject() {
  const elll = useElll();
  const project = useObservable(
    getElllWorkspaceElementaProject$(elll),
    getElllWorkspaceElementaProject(elll),
  );
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}
