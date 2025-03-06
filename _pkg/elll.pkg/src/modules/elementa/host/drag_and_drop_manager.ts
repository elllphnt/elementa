import { entityTypes } from "@elllphnt/elll-element";
import {} from "@repo/elementa";
import {
  DropOptions,
  handleTypes,
  IEntityHandle,
  IHandle,
} from "@repo/elementa-interactor";
import { mimeTypes } from "~/src/libs/mimetypes";
import { IElll } from "~/src/types/elll";
import { EntityFactory } from "./entity_factory";

const commonAcceptDropTypes = ["file", "text/plain", "application/json"];

const entityAcceptDropTypesMap = {
  [entityTypes.widgets.frame]: [...commonAcceptDropTypes],
  [entityTypes.elements.container]: [...commonAcceptDropTypes],
  [entityTypes.elements.text]: [...commonAcceptDropTypes],
  [entityTypes.elements.components.code]: [...commonAcceptDropTypes],
  [entityTypes.elements.components.elll]: [...commonAcceptDropTypes],
  [entityTypes.elements.media]: [...commonAcceptDropTypes],
  [entityTypes.elements.vector]: [...commonAcceptDropTypes],
  [entityTypes.canvas]: [...commonAcceptDropTypes],
};

export class DragAndDropManager {
  private entityFactory: EntityFactory;

  constructor({ elll }: { elll: IElll }) {
    this.entityFactory = new EntityFactory(elll);
  }

  // Handle drop

  handleFileDrop(
    target: IHandle,
    files: FileList,
    options?: DropOptions,
  ): IHandle[] | undefined {
    const component = target.interactor.stager.elementa.component;
    if (!component) return;

    const entities = this.entityFactory.createEntitiesFromFiles(
      files,
      component,
    );
    if (!entities.length) return;

    return target.handleEntityDrop(entities, options);
  }
  handleUriListDrop(
    target: IHandle,
    uris: string,
    options?: DropOptions,
  ): IHandle[] | undefined {
    const component = target.interactor.stager.elementa.component;
    if (!component) return;

    const entities = this.entityFactory.createEntitiesFromUris(
      uris.split(","),
      component,
    );
    if (!entities.length) return;

    return target.handleEntityDrop(entities, options);
  }
  handleTextDrop(
    target: IHandle,
    text: string,
    options?: DropOptions,
  ): IHandle[] | undefined {
    const component = target.interactor.stager.elementa.component;
    if (!component) return;

    const entities = this.entityFactory.createEntitiesFromText(text, component);
    if (!entities.length) return;

    return target.handleEntityDrop(entities, options);
  }
  handleDrop(
    target: IHandle,
    data: Record<string, any>,
    options?: DropOptions,
  ): IHandle[] {
    let handles: IHandle[] | undefined;
    if (!handles && "__files" in data) {
      handles = this.handleFileDrop(target, data.__files, options);
    }
    if (!handles && mimeTypes.uriList in data) {
      handles = this.handleUriListDrop(
        target,
        data[mimeTypes.uriList],
        options,
      );
    }
    if (!handles && "text/plain" in data) {
      handles = this.handleTextDrop(target, data["text/plain"], options);
    }
    return handles ?? [];
  }

  // Accept drop

  acceptFallbackDrop({ datatypes }: { datatypes: string[] }) {
    return datatypes.some((type) => commonAcceptDropTypes.includes(type));
  }
  acceptEntityDrop(
    handle: IEntityHandle,
    {
      datatypes,
    }: {
      datatypes: string[];
    },
  ) {
    const entityType = handle.entity.type;
    const acceptedTypes = entityAcceptDropTypesMap[entityType];
    if (!acceptedTypes) return false;
    return datatypes.some((type) => acceptedTypes.includes(type));
  }
  acceptDrop(
    handle: IHandle,
    {
      datatypes,
    }: {
      datatypes: string[];
    },
  ) {
    switch (handle.type) {
      case handleTypes.fallback:
        return this.acceptFallbackDrop({ datatypes });
      case handleTypes.element:
        return this.acceptEntityDrop(handle as IEntityHandle, { datatypes });
      case handleTypes.frame:
        return this.acceptEntityDrop(handle as IEntityHandle, { datatypes });
    }
    return false;
  }
}
