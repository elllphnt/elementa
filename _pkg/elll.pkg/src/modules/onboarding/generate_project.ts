import { IElll } from "~/src/types/elll";

export async function generateProject({
  elll,
  prompt,
}: {
  elll: IElll;
  prompt: {
    type: string;
    title: string;
    description: string;
  };
}) {
  // try {
  //   // create project
  //   const tenant = elll.tenant;
  //   if (!tenant) {
  //     throw new Error("Tenant not found");
  //   }
  //   const repository = await tenant.createRepository({
  //     name: prompt.title,
  //     type: prompt.type,
  //   });
  //   if (!repository) {
  //     throw new Error("Repository not created");
  //   }
  //   // open project
  //   elll.host.openProject(repository.id);
  //   const generateProjectModalKey = elll.shell.showModal({
  //     viewId: modalViews.spec.id,
  //     affinity: "workspace",
  //     props: {
  //       prompt,
  //       onCompleted: () => {
  //         elll.shell.hideModal(generateProjectModalKey);
  //       },
  //     },
  //   });
  //   // set project description
  //   const project = elll.config<ElllElementaProject>(
  //     keys.configs.editors.elementa.project,
  //   );
  //   if (!project) {
  //     throw new Error("Project not found");
  //   }
  //   await firstValueFrom(
  //     project.spec.loaded$.pipe(filter(Boolean), timeout(5000)),
  //   );
  //   project.spec.update({
  //     type: prompt.type,
  //     description: prompt.description,
  //   });
  //   // generate features
  //   await project.spec.generateFeatures();
  //   await project.spec.organizeFeatures();
  // } catch (error) {
  //   elll.shell.showNotification({
  //     title: "Project Generation Failed",
  //     message:
  //       "An error occurred while generating the project. Please try again later.",
  //     duration: 5000,
  //   });
  // }
}
