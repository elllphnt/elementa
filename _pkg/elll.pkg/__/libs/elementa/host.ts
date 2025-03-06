import {
  elllEntities,
  elllFileTypes,
  getUrlScheme,
  makeFidUrl,
  parseFidUrl,
  switchFileType,
} from "@elllphnt/utils";
import { Resource, WorkspaceFile } from "@repo/backend";
import {
  CodeComponentElement,
  Component,
  ComponentElementHandle,
  ContainerElementHandle,
  ContextMenuOption,
  ElementaEditorMode,
  ElllComponentElement,
  Entity,
  FallbackHandle,
  FrameWidgetHandle,
  Handle,
  Host,
  PointData,
  Prop,
  PropControllerWidget,
  State,
  StateControllerWidget,
  TextElement,
  TextElementHandle,
  VectorElementHandle,
  Widget,
  elementaEditorProperties,
  entityTypeMatch,
  entityTypes,
  switchEntityType,
} from "@repo/elementa";
import { IElll } from "~/src/elll/_types";
import { mimeTypes } from "../constants/mime_types";
import { EditorManager } from "../editor_manager";
import { parseElementaUrl } from "./uris";

const commonAcceptDropTypes = ["file", "text/plain", "application/json"];

const entityAcceptDropTypesMap = {
  [entityTypes.widgets.frame]: [...commonAcceptDropTypes],
  [entityTypes.elements.container]: [...commonAcceptDropTypes],
  [entityTypes.elements.text]: [...commonAcceptDropTypes],
  [entityTypes.elements.component]: [...commonAcceptDropTypes],
  [entityTypes.elements.media]: [...commonAcceptDropTypes],
  [entityTypes.elements.vector]: [...commonAcceptDropTypes],
  [entityTypes.canvas]: [...commonAcceptDropTypes],
};

const dragOverTimeoutDurationMs = 300; // 3 times the browser firering interval

export class ElementaHost extends Host {
  elll: IElll;
  window: Window;

  private _dragOverTimeout: any;
  private _getIframe: () => HTMLElement;

  get editorManager() {
    return this.elll.properties.value<EditorManager>(EditorManager.key);
  }

  constructor({
    elll,
    getIframe,
  }: {
    elll: IElll;
    getIframe: () => HTMLElement;
  }) {
    super();
    this.elll = elll;
    this._getIframe = getIframe;
    this.window = window;
  }

  goTo(url: string): void {
    this.elll.editorManager.openFile(url);
  }

  showContextMenu(position: PointData, options: ContextMenuOption[][]): void {
    const iframe = this._getIframe();
    const rect = iframe.getBoundingClientRect();
    this.elll.shell.showContextMenu({
      position: {
        x: position.x + rect.left,
        y: position.y + rect.top,
      },
      options,
    });
  }

  hideContextMenu(): void {
    this.elll.shell.hideContextMenu();
  }

  // drag and drop

  get dropTypes(): string[] {
    return ["file"];
  }

  createEntityFromWorspaceFile({
    file,
    component,
  }: {
    file: WorkspaceFile;
    component: Component;
  }): Entity | undefined {
    if (!file.type) return undefined;
    return switchFileType<Entity | undefined>(
      file.type,
      {
        [elllFileTypes.components.elll]: () => {
          const componentElement = new ElllComponentElement({
            component,
          });
          componentElement.setComponentUrl(
            makeFidUrl({
              id: file.id,
            }),
          );
          return componentElement;
        },
        [elllFileTypes.components.react]: () => {
          const componentElement = new CodeComponentElement({
            component,
          });
          componentElement.setComponentUrl(
            makeFidUrl({
              id: file.id,
            }),
          );
          return componentElement;
        },
        [elllFileTypes.state]: () => {
          const state = new State({ component });
          state.setName(file.name);
          state.setModuleUrl(
            makeFidUrl({
              id: file.id,
            }),
          );
          return state;
        },
      },
      () => undefined,
    );
  }
  // createEntityFromDriveFile({
  //   file,
  //   component,
  // }: {
  //   file: DriveFile;
  //   component: Component;
  // }): Entity | undefined {
  //   if (!file.type) return undefined;
  //   if (file.type === "text/plain") {
  //     const textElement = new TextElement({ component });
  //     textElement.setTextContent(file.textContent ?? "");
  //     return textElement;
  //   } else if (file.type === "application/json") {
  //     const textElement = new TextElement({ component });
  //     textElement.setTextContent(file.textContent ?? "");
  //     return textElement;
  //   } else if (file.type.startsWith("image/")) {
  //     const mediaElement = new MediaElement({ component });
  //     mediaElement.setContent({
  //       type: "image",
  //       src: `https://elllusercontent.com/${file.driveId}/${file.id}`,
  //     } as ImageMediaContentData);
  //     return mediaElement;
  //   } else if (file.type === "application/pdf") {
  //     const mediaElement = new MediaElement({ component });
  //     mediaElement.setContent({
  //       type: "pdf",
  //       src: `https://elllusercontent.com/${file.driveId}/${file.id}`,
  //     } as ImageMediaContentData);
  //     return mediaElement;
  //   }
  // }

  createEntityFromElllResource({
    resource,
    component,
  }: {
    resource: Resource;
    component: Component;
  }): Entity | undefined {
    switch (resource.entity) {
      case elllEntities.workspaceFile.name: {
        return this.createEntityFromWorspaceFile({
          file: resource as WorkspaceFile,
          component,
        });
      }
      // case "drive-file": {
      //   return this.createEntityFromDriveFile({
      //     file: resource as DriveFile,
      //     component,
      //   });
      // }
    }
  }

  createDropEntityFromSourceEntity({
    entity,
  }: {
    entity: Entity;
  }): Entity | undefined {
    if (entity instanceof State) {
      const controller = new StateControllerWidget({
        component: entity.component,
      });
      controller.setTargetId(entity.id);
      return controller;
    }
    if (entity instanceof Prop) {
      const controller = new PropControllerWidget({
        component: entity.component,
      });
      controller.setTargetId(entity.id);
      return controller;
    }
  }

  createEntityFromUrl({
    url,
    component,
  }: {
    url: string;
    component: Component;
  }): Entity | undefined {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      case "fid": {
        const { id } = parseFidUrl(url);
        const workspaceId = this.elll.workspaceId;
        if (!workspaceId) return undefined;

        const file = this.elll.backend.instance<WorkspaceFile>(id);
        if (file) {
          return this.createEntityFromWorspaceFile({
            file,
            component,
          });
        } else {
          return undefined;
        }
      }
      case "elll": {
        const resource = this.elll.backend.instance(url, true);
        if (resource) {
          return this.createEntityFromElllResource({
            resource,
            component,
          });
        } else {
          return undefined;
        }
      }
      case "elementa": {
        const { resourceType, resourceId } = parseElementaUrl(url);
        if (resourceType === "entity") {
          const entity = component.entity(resourceId);
          if (entity) {
            return this.createDropEntityFromSourceEntity({
              entity,
            });
          }
        }
      }
    }
  }

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
    // else if (type.startsWith("image/")) {
    //   const contentElement = new MediaElement({ component });
    //   file.arrayBuffer().then((buffer) => {
    //     // blob url
    //     const blob = new Blob([buffer], { type: file.type });
    //     const url = URL.createObjectURL(blob);
    //     contentElement.setContent({
    //       type: "image",
    //       src: url,
    //     } as ImageMediaContentData);
    //   });
    // return contentElement;
    // }
  }

  handleAfterDrop(event: DragEvent, target: Handle, handles: Handle[]) {
    if (
      handles.some((handle) =>
        entityTypeMatch(handle.entity.type, entityTypes.widgets.controller),
      )
    ) {
      target.editor.setProperty(
        elementaEditorProperties.mode,
        ElementaEditorMode.Flow,
      );
    }
  }

  handleEntityContainerDrop(event: DragEvent, target: Handle): Handle[] {
    const position = target.editor.viewport.windowToContent({
      x: event.clientX,
      y: event.clientY,
    });

    const files = event.dataTransfer?.files;
    if (files?.length) {
      const entities = Array.from(files)
        .map((file) => {
          const entity = this.createEntityFromFile(
            file,
            target.entity.component,
          );
          return entity;
        })
        .filter((entity) => entity) as Entity[];

      if (entities.length > 0) {
        return target.dropEntities({ entities, position });
      }
    }

    const types = event.dataTransfer?.types ?? [];

    if (types.includes(mimeTypes.uriList)) {
      const uris = event.dataTransfer?.getData(mimeTypes.uriList);
      if (uris) {
        const urls = uris.split("\n");
        const entities = urls
          .map((url) =>
            this.createEntityFromUrl({
              url,
              component: target.entity.component,
            }),
          )
          .filter((entity) => entity) as Entity[];

        if (entities.length > 0) {
          const position = target.editor.viewport.windowToContent({
            x: event.clientX,
            y: event.clientY,
          });

          entities.forEach((entity) => {
            if (entity instanceof Widget) {
              entity.setX(position.x);
              entity.setY(position.y);
            }
          });

          return target.dropEntities({ entities, position });
        }
      }
    }

    if (types.includes("text/plain")) {
      const text = event.dataTransfer?.getData("text/plain");
      if (text) {
        const textElement = new TextElement({
          component: target.entity.component,
        });
        textElement.setTextContent(text);
        return target.dropEntities({ entities: [textElement], position });
      }
    }

    const textElement = new TextElement({ component: target.entity.component });
    textElement.setTextContent(JSON.stringify(types));
    return target.dropEntities({ entities: [textElement], position });
  }

  handleFallbackDrop(event: DragEvent, target: FallbackHandle) {
    return this.handleEntityContainerDrop(event, target);
  }
  handleFrameDrop(event: DragEvent, target: FrameWidgetHandle) {
    return this.handleEntityContainerDrop(event, target);
  }

  handleContainerDrop(event: DragEvent, target: ContainerElementHandle) {
    return this.handleEntityContainerDrop(event, target);
  }

  handleTextDrop(event: DragEvent, target: TextElementHandle) {
    return [];
  }

  handleComponentDrop(event: DragEvent, target: ComponentElementHandle) {
    return [];
  }
  handleVectorDrop(event: DragEvent, target: VectorElementHandle) {
    return [];
  }

  handleDragEnter(event: DragEvent, handle: Handle): void {
    const types = event.dataTransfer?.types ?? [];
    const entityType = handle.entity.type;
    const acceptedTypes = entityAcceptDropTypesMap[entityType];
    if (!acceptedTypes) return;
    if (types.some((type) => acceptedTypes.includes(type))) {
      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }

      this.setDropTarget(handle);
    }
  }
  handleDragLeave(event: DragEvent, handle: Handle): void {}
  handleDrop(event: DragEvent, handle: Handle): void {
    const dropped = switchEntityType<Handle[]>(
      handle.entity.type,
      {
        [entityTypes.widgets.frame]: () => {
          return this.handleFrameDrop(event, handle as FrameWidgetHandle);
        },
        [entityTypes.elements.container]: () => {
          return this.handleContainerDrop(
            event,
            handle as ContainerElementHandle,
          );
        },
        [entityTypes.elements.text]: () => {
          return this.handleTextDrop(event, handle as TextElementHandle);
        },
        [entityTypes.elements.component]: () => {
          return this.handleComponentDrop(
            event,
            handle as ComponentElementHandle,
          );
        },
        // [entityTypes.elements.media]: () => {
        //   return this.handleMediaDrop(event, handle as MediaElementHandle);
        // },
        [entityTypes.elements.vector]: () => {
          return this.handleVectorDrop(event, handle as VectorElementHandle);
        },
      },
      () => {
        return this.handleFallbackDrop(event, handle as FallbackHandle);
      },
    );

    this.handleAfterDrop(event, handle, dropped);
  }
  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this._dragOverTimeout) {
      clearTimeout(this._dragOverTimeout);
    }

    if (!this.isDragging) {
      this.setDragging(true);
    }

    this._dragOverTimeout = setTimeout(() => {
      this.setDragging(false);
      this.setDropTarget(undefined);
    }, dragOverTimeoutDurationMs);
  }

  toast(message: string): void {
    this.elll.shell.toast({ message });
  }
}
