import { keys } from "~/src/libs/keys";
import { IElll } from "~/src/types/elll";
import { getElllWorkspaceElementaProject } from "../elementa/project/_lib";

export async function generateProject({
  elll,
  prompt,
  type,
  title,
}: {
  elll: IElll;
  type: string;
  title: string;
  prompt: string;
}) {
  const tenant = elll.tenant;
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const repository = await elll.tenant.createRepository({
    type,
    name: title,
  });
  elll.host.openProject(repository.id);

  const project = getElllWorkspaceElementaProject(elll);
  project?.app.generateBrief({ prompt }).then(() => {
    project?.app.generateFeatures();
  });

  await elll.shell.workspace?.untilInitialized();
  elll.editorManager.openEditor(keys.editors.brief);
}
