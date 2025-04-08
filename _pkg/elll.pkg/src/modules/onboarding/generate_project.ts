import { IElll } from "~/src/types/elll";
import { modalViews } from "~/src/views/modals/_";

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

  elll.shell.showModal({
    viewId: modalViews.brief.id,
    affinity: "workspace",
    closeOnBackdropClick: true,
    closeOnEscape: true,
    props: {
      prompt,
    },
  });
}
