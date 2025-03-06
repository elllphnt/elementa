import {
  ElementaEditorMode,
  elementaEditorProperties,
  Entity,
  entityTypeMatch,
  entityTypes,
  Handle,
  Host,
  switchEntityType,
  TextElement,
  Widget,
} from "@repo/elementa";
import { mimeTypes } from "~/src/libs/mimetypes";
import { IElll } from "~/src/types/elll";
import { EntityFactory } from "./entity_factory";

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

export class DragAndDropManager {
  private host: Host;
  private _dragOverTimeout: any;
  private readonly DRAG_OVER_TIMEOUT_MS = 300;
  private entityFactory: EntityFactory;

  constructor({ host, elll }: { host: Host; elll: IElll }) {
    this.host = host;

    this.entityFactory = new EntityFactory(elll);
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

      this.host.setDropTarget(handle);
    }
  }

  handleDragLeave(event: DragEvent, handle: Handle): void {}

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this._dragOverTimeout) {
      clearTimeout(this._dragOverTimeout);
    }

    if (!this.host.isDragging) {
      this.host.setDragging(true);
    }

    this._dragOverTimeout = setTimeout(() => {
      this.host.setDragging(false);
      this.host.setDropTarget(undefined);
    }, this.DRAG_OVER_TIMEOUT_MS);
  }

  handleDrop(event: DragEvent, handle: Handle): void {
    const dropped = switchEntityType<Handle[]>(
      handle.entity.type,
      {
        [entityTypes.widgets.frame]: () => {
          return this.doContainerDrop(event, handle);
        },
        [entityTypes.elements.container]: () => {
          return this.doContainerDrop(event, handle);
        },
      },
      () => {
        return this.doContainerDrop(event, handle);
      },
    );

    this.finalizeDrop(event, handle, dropped);
  }

  private doContainerDrop(event: DragEvent, target: Handle): Handle[] {
    const position = target.editor.viewport.windowToContent({
      x: event.clientX,
      y: event.clientY,
    });

    // Handle files

    const files = event.dataTransfer?.files;
    if (files?.length) {
      const entities = this.createEntitiesFromFiles(
        files,
        target.entity.component,
      );
      if (entities.length) return target.dropEntities({ entities, position });
    }

    // Handle URIs

    const types = event.dataTransfer?.types ?? [];
    if (types.includes(mimeTypes.uriList)) {
      const uris = event.dataTransfer?.getData(mimeTypes.uriList);
      const entities = this.createEntitiesFromURIs(
        uris,
        target.entity.component,
        event,
      );
      if (entities?.length) return target.dropEntities({ entities, position });
    }

    // Handle text

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

    // Handle any other types

    const textElement = new TextElement({ component: target.entity.component });
    textElement.setTextContent(JSON.stringify(types));
    return target.dropEntities({ entities: [textElement], position });
  }
  private finalizeDrop(
    event: DragEvent,
    target: Handle,
    handles: Handle[],
  ): void {
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

  private createEntitiesFromFiles(files: FileList, component: any): Entity[] {
    const entities = Array.from(files)
      .map((file) => {
        const entity = this.entityFactory.createEntityFromFile(file, component);
        return entity;
      })
      .filter((entity) => entity) as Entity[];

    return entities;
  }
  private createEntitiesFromURIs(
    uris: string | undefined,
    component: any,
    event: DragEvent,
  ): Entity[] | undefined {
    if (!uris) return;

    const urls = uris.split("\n");
    const entities = urls
      .map((url) =>
        this.entityFactory.createEntityFromUrl({
          url,
          component,
        }),
      )
      .filter((entity) => entity) as Entity[];

    if (entities.length > 0) {
      const position = {
        x: event.clientX,
        y: event.clientY,
      };

      entities.forEach((entity) => {
        if (entity instanceof Widget) {
          entity.setX(position.x);
          entity.setY(position.y);
        }
      });
    }

    return entities;
  }
}
