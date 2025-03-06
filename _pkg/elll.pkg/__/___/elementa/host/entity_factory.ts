import {
  elllEntities,
  elllFileTypes,
  getUrlScheme,
  parseElllUrl,
  switchFileType,
} from "@elllphnt/utils";
import { Resource, WorkspaceFile } from "@repo/backend";
import {
  CodeComponentElement,
  Component,
  ElllComponentElement,
  Entity,
  State,
  TextElement,
} from "@repo/elementa";
import { makeRelativeFileUrl } from "~/src/libs/url";
import { IElll } from "~/src/types/elll";

export class EntityFactory {
  constructor(private elll: IElll) {}

  ////////////// CREATE ENTITY FROM URL //////////////

  createEntityFromUrl({
    url,
    component,
  }: {
    url: string;
    component: Component;
  }): Entity | undefined {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      case "elll": {
        return this.createEntityFromElllUrl({ url, component });
      }
    }
  }

  /// Elll Url

  private createEntityFromElllUrl({
    url,
    component,
  }: {
    url: string;
    component: Component;
  }): Entity | undefined {
    const urlStruct = parseElllUrl(url);
    if (!urlStruct) return;

    const { id } = urlStruct;
    return this.createEntityFromElllResource({
      resource: this.elll.backend.instance(id, true),
      component,
    });
  }

  private createEntityFromElllResource({
    resource,
    component,
  }: {
    resource: Resource;
    component: Component;
  }): Entity | undefined {
    switch (resource.entity) {
      case elllEntities.workspaceFile.name: {
        return this.createEntityFromWorkspaceFile({
          file: resource as WorkspaceFile,
          component,
        });
      }
    }
  }

  private createEntityFromWorkspaceFile({
    file,
    component,
  }: {
    file: WorkspaceFile;
    component: Component;
  }): Entity | undefined {
    if (!file.type) {
      this.elll.shell.toast("File not loaded");
      return;
    }

    return switchFileType<Entity | undefined>(
      file.type,
      {
        [elllFileTypes.components.elll]: () => {
          const componentElement = new ElllComponentElement({
            component,
          });
          componentElement.setComponentUrl(
            makeRelativeFileUrl(component.url, file.url),
          );
          return componentElement;
        },
        [elllFileTypes.components.react]: () => {
          const componentElement = new CodeComponentElement({
            component,
          });
          componentElement.setComponentUrl(
            makeRelativeFileUrl(component.url, file.url),
          );
          return componentElement;
        },
        [elllFileTypes.state]: () => {
          const state = new State({ component });
          state.setName(file.name);
          state.setModuleUrl(makeRelativeFileUrl(component.url, file.url));
          return state;
        },
      },
      () => undefined,
    );
  }

  ////////////// CREATE ENTITY FROM FILE //////////////

  createEntityFromFile(file: File, component: Component): Entity | undefined {
    const type = file.type;
    if (type === "application/json") {
      const textElement = new TextElement({ component });
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        textElement.setTextContent(text);
      };
      reader.readAsText(file);
      return textElement;
    }
  }
}
