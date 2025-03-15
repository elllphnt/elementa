import {
  elllEntities,
  elllFileTypes,
  getUrlScheme,
  parseElllUrl,
  switchFileType,
} from "@elllphnt/utils";
import {
  CommitFile,
  DriveFile,
  File as ElllFile,
  Resource,
  WorkspaceFile,
} from "@repo/backend";
import {
  Component,
  ComponentElement,
  Entity,
  MediaElement,
  parseElementaEntityResourceId,
  parseElementaUrl,
  PrimitiveElement,
  TextElement,
} from "@repo/elementa-models";
import { makeRelativeFileUrl } from "~/src/libs/url";
import {
  ComponentModel,
  componentModelConstructor,
} from "~/src/models/component";
import { IElll } from "~/src/types/elll";

export class EntityFactory {
  constructor(private elll: IElll) {}

  ////////////// CREATE ENTITY FROM URI LIST //////////////

  private createEntityFromElllResource({
    resource,
    component,
  }: {
    resource: Resource;
    component: Component;
  }): Entity | undefined {
    switch (resource.entity) {
      case elllEntities.workspaceFile.name: {
        return this.createEntityFromRepoFile({
          file: resource as WorkspaceFile,
          component,
        });
      }
      case elllEntities.commitFile.name: {
        return this.createEntityFromRepoFile({
          file: resource as CommitFile,
          component,
        });
      }
      case elllEntities.driveFile.name: {
        return this.createEntityFromDriveFile({
          file: resource as DriveFile,
          component,
        });
      }
    }
  }

  private createEntityFromRepoFile({
    file,
    component,
  }: {
    file: ElllFile;
    component: Component;
  }): Entity | undefined {
    if (!file.type) {
      this.elll.shell.toast("File not loaded");
      return;
    }

    return switchFileType<Entity | undefined>(
      file.type,
      {
        [elllFileTypes.component]: () => {
          const componentElement = new ComponentElement({
            component,
          });
          componentElement.setComponentUrl(
            makeRelativeFileUrl(component.url, file.url),
          );
          return componentElement;
        },
        [elllFileTypes.primitive]: () => {
          const primitiveElement = new PrimitiveElement({
            component,
          });
          primitiveElement.setModuleUrl(
            makeRelativeFileUrl(component.url, file.url),
          );
          return primitiveElement;
        },
        // [elllFileTypes.state]: () => {
        //   const state = new State({ component });
        //   state.setName(file.name);
        //   state.setModuleUrl(makeRelativeFileUrl(component.url, file.url));
        //   return state;
        // },
      },
      () => undefined,
    );
  }

  private createEntityFromDriveFile({
    file,
    component,
  }: {
    file: DriveFile;
    component: Component;
  }): Entity | undefined {
    if (!file.type) {
      this.elll.shell.toast("File not loaded");
      return;
    }

    // handle by type
    if (file.type.startsWith("image/")) {
      const element = new MediaElement({ component });
      element.setMedia({
        type: "image",
        src: file.edfUrl,
      });
      element.setFit("cover");

      return element;
    } else if (file.type.startsWith("video/")) {
      const element = new MediaElement({ component });
      element.setMedia({
        type: "video",
        src: file.edfUrl,
      });
      element.setFit("cover");

      return element;
    }
  }

  createEntityFromElllUrl(
    url: string,
    component: Component,
  ): Entity | undefined {
    const urlStruct = parseElllUrl(url);
    if (!urlStruct) return;

    const { id } = urlStruct;
    return this.createEntityFromElllResource({
      resource: this.elll.backend.instance(id, true),
      component,
    });
  }

  getElementaEntity(componentUrl: string, entityId: string) {
    const component = this.elll.modelManager.getModel(
      componentModelConstructor.name,
      componentUrl,
    ) as ComponentModel;
    const entity = component.entity(entityId);
    entity?.remove();
    return entity;
  }
  getEntityFromElementaUrl(url: string): Entity | undefined {
    const urlStruct = parseElementaUrl(url);
    if (!urlStruct) return;

    const { resourceType, resourceId } = urlStruct;

    switch (resourceType) {
      case "entity": {
        const idStruct = parseElementaEntityResourceId(resourceId);
        if (!idStruct) return;

        const { componentUrl, entityId } = idStruct;
        return this.getElementaEntity(componentUrl, entityId);
      }
    }
  }

  createEntityFromUri(uri: string, component: Component): Entity | undefined {
    const scheme = getUrlScheme(uri);
    switch (scheme) {
      case "elll": {
        return this.createEntityFromElllUrl(uri, component);
      }
      case "elementa": {
        return this.getEntityFromElementaUrl(uri);
      }
    }
  }
  createEntitiesFromUris(uris: string[], component: Component): Entity[] {
    const entities = uris
      .map((url) => this.createEntityFromUri(url, component))
      .filter(Boolean) as Entity[];

    return entities;
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

  createEntitiesFromFiles(files: FileList, component: Component): Entity[] {
    const entities = Array.from(files)
      .map((file) => {
        const entity = this.createEntityFromFile(file, component);
        return entity;
      })
      .filter(Boolean) as Entity[];

    return entities;
  }

  ////////////// CREATE ENTITY FROM TEXT //////////////

  createEntitiesFromText(text: string, component: Component): Entity[] {
    const textElement = new TextElement({
      component,
    });
    // textElement.setContent(text);
    return [textElement];
  }
}
