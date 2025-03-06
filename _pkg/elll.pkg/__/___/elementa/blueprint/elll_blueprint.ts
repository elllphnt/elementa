import { map, of, switchMap } from "rxjs";
import { planFeature } from "~/src/libs/ai_generation/planning/plan_feature";
import { getElllephantApiClient } from "~/src/libs/ai_generation/utils";
import { mimeTypes } from "~/src/libs/mimetypes";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";
import { Blueprint } from "./blueprint";
import { Component } from "./component";
import { View } from "./view";

const blueprintFilePath = ".elll/blueprint";

export class ElllBlueprint extends Blueprint {
  readonly project: ElllProject;

  get elll(): IElll {
    return this.project.elll;
  }

  get file() {
    return elllFileAtPath(this.elll, blueprintFilePath, {
      type: mimeTypes.json,
    });
  }
  get file$() {
    return elllFileAtPath$(this.elll, blueprintFilePath, {
      type: mimeTypes.json,
    });
  }

  get model() {
    return this.file
      ? this.elll.modelManager.getModel(
          jsonModelConstructor.name,
          this.file.url,
        )
      : undefined;
  }
  get model$() {
    return this.file$.pipe(
      map((file) =>
        file
          ? this.elll.modelManager.getModel(jsonModelConstructor.name, file.url)
          : undefined,
      ),
    );
  }

  get contentData$() {
    return this.model$.pipe(
      switchMap((model) => (model ? model.content.data$ : of({}))),
    );
  }
  get contentData() {
    return this.model?.content.data ?? {};
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    let syncing = false;
    // Restore data
    const restoreSubscription = this.contentData$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.restore(data);
      } finally {
        syncing = false;
      }
    });
    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.model?.content.update(data);
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }

  async planFeature(featureId: string) {
    const client = getElllephantApiClient(this.elll);
    const spec = this.project.spec;
    const type = spec.type;
    const description = spec.description;
    const feature = spec.feature(featureId);

    if (!type || !description || !feature) {
      this.elll.shell.notificationManager.showNotification({
        title: "Failed to plan feature",
        message: "Type and description are required to plan a feature.",
      });
      return;
    }

    feature.setPlanning(true);

    try {
      const plan = await planFeature({
        client,
        type,
        description,
        feature: feature.data,
        views: this.views.map((view) => view.data),
        tools: {
          getView: (viewId) => {
            const view = this.view(viewId);
            return view?.data;
          },
        },
      });

      for (const viewData of plan.addViews) {
        const view = new View();
        view.setName(viewData.name);
        view.setType(viewData.type);
        view.setDescription(viewData.description);

        for (const componentData of viewData.components) {
          const component = new Component();
          component.setName(componentData.name);
          component.setDescription(componentData.description);

          // set displays
          componentData.displays.forEach((display) => {
            component.setDisplay(display.name, {
              description: display.description,
              featureIds: [feature.id],
            });
          });

          // set interactions
          componentData.interactions.forEach((interaction) => {
            component.setInteraction(interaction.name, {
              description: interaction.description,
              featureIds: [feature.id],
            });
          });

          // set links
          componentData.links.forEach((link) => {
            component.setLink(link.name, {
              viewId: link.viewId,
              featureIds: [feature.id],
            });
          });

          this.addComponent(component);
          view.setComponentIds([...view.componentIds, component.id]);
        }

        this.addView(view);
      }

      for (const viewData of plan.useViews) {
        const view = this.view(viewData.id);
        if (!view) {
          console.warn(`View ${viewData.id} not found`);
          continue;
        }

        for (const componentData of viewData.addComponents) {
          const component = new Component();
          component.setName(componentData.name);
          component.setDescription(componentData.description);

          // set displays
          componentData.displays.forEach((display) => {
            component.setDisplay(display.name, {
              description: display.description,
              featureIds: [feature.id],
            });
          });

          // set interactions
          componentData.interactions.forEach((interaction) => {
            component.setInteraction(interaction.name, {
              description: interaction.description,
              featureIds: [feature.id],
            });
          });

          // set links
          componentData.links.forEach((link) => {
            component.setLink(link.name, {
              viewId: link.viewId,
              featureIds: [feature.id],
            });
          });

          this.addComponent(component);
          view.setComponentIds([...view.componentIds, component.id]);
        }

        for (const componentData of viewData.useComponents) {
          const component = this.component(componentData.id);
          if (!component) {
            console.warn(`Component ${componentData.id} not found`);
            continue;
          }

          for (const displayName of componentData.useDisplays) {
            const display = component.display(displayName);
            if (!display) {
              console.warn(`Display ${displayName} not found`);
              continue;
            }

            component.setDisplay(displayName, {
              ...display,
              featureIds: [...(display.featureIds ?? []), feature.id],
            });
          }
          for (const interactionName of componentData.useInteractions) {
            const interaction = component.interaction(interactionName);
            if (!interaction) {
              console.warn(`Interaction ${interactionName} not found`);
              continue;
            }

            component.setInteraction(interactionName, {
              ...interaction,
              featureIds: [...(interaction.featureIds ?? []), feature.id],
            });
          }
          for (const linkName of componentData.useLinks) {
            const link = component.link(linkName);
            if (!link) {
              console.warn(`Link ${linkName} not found`);
              continue;
            }

            component.setLink(linkName, {
              ...link,
              featureIds: [...(link.featureIds ?? []), feature.id],
            });
          }

          for (const displayData of componentData.addDisplays) {
            component.setDisplay(displayData.name, {
              description: displayData.description,
              featureIds: [feature.id],
            });
          }
          for (const interactionData of componentData.addInteractions) {
            component.setInteraction(interactionData.name, {
              description: interactionData.description,
              featureIds: [feature.id],
            });
          }
          for (const linkData of componentData.addLinks) {
            component.setLink(linkData.name, {
              viewId: linkData.viewId,
              featureIds: [feature.id],
            });
          }
        }
      }
    } finally {
      feature.setPlanning(false);
    }
  }
}
