import { EntityData } from "@elllphnt/elementa-base";
import { Element } from "@elllphnt/elementa-models";
import { VectorData } from "@elllphnt/elementa-utils";
import _ from "lodash";
import {
  ContainerElementHandle,
  ElementHandle,
  EntityHandle,
  Handle,
} from "~/src";
import {
  duplicateEntityHandles,
  unwrapElements,
  wrapElements,
} from "~/src/_lib/_";
import { IElementaInteractor, IMovableHandle } from "~/src/_types/_";
import { CommandHandler } from "~/src/_types/managers/command";
import { handleProperties } from "../../handles/_libs/properties";

function moveStaticElement(element: Element, direction: number) {
  const container = element.container;
  if (!container) return;

  const elements = container.content;
  const index = elements.indexOf(element);
  const newIndex = _.clamp(index + direction, 0, elements.length - 1);
  container.moveElements(newIndex, element);
}

function handleMove(interactor: IElementaInteractor, delta: VectorData) {
  const selection = interactor.interactionManager.selection;
  if (selection.length === 0) return;

  const newHandles = selection
    .map((handle) => {
      if (handle.property(handleProperties.isMovable)) {
        const movable = handle as unknown as IMovableHandle;
        const rect = handle.contentRect;
        if (rect) {
          const newRect = rect.offset(delta);
          movable.setPosition(newRect.topLeft);
        }
        return handle;
      } else if (handle instanceof ElementHandle) {
        moveStaticElement(handle.entity, delta.x || delta.y);
        return handle.parent?.entityHandle(handle.entity);
      }
    })
    .filter(Boolean) as Handle[];

  interactor.interactionManager.select(newHandles);
}

function handleMoveZIndex(interactor: IElementaInteractor, delta: number) {
  const selection = interactor.interactionManager.selection;
  const elementHandles = selection.filter(
    (handle) => handle instanceof ElementHandle
  ) as ElementHandle[];
  if (elementHandles.length === 0) return;

  elementHandles.forEach((handle) => {
    const zIndex = handle.style.resolvedPropertyWithoutUnset("z-index") ?? 0;
    handle.style.setProperty("z-index", zIndex + delta);
  });
}

export const copy: CommandHandler = (interactor) => {
  const selection = interactor.interactionManager.selection.filter(
    (handle) => handle instanceof EntityHandle
  ) as EntityHandle[];
  if (selection.length === 0) return;
  const data = {
    type: "entitylist",
    entities: selection.map((handle) => handle.entity.definitionData),
  };
  window.localStorage.setItem("elementa.clipboard", JSON.stringify(data));
};

export const cut: CommandHandler = (interactor) => {
  const selection = interactor.interactionManager.selection.filter(
    (handle) => handle instanceof EntityHandle
  ) as EntityHandle[];
  if (selection.length === 0) return;
  const data = {
    type: "entitylist",
    entities: selection.map((handle) => handle.entity.definitionData),
  };
  window.localStorage.setItem("elementa.clipboard", JSON.stringify(data));
  selection.forEach((instance) => {
    instance.entity.remove();
    instance.dispose();
  });
  interactor.interactionManager.clearSelection();
};

export const paste: CommandHandler = (interactor) => {
  const datastring = window.localStorage.getItem("elementa.clipboard");
  if (!datastring) return;
  const data = JSON.parse(datastring) as {
    type: string;
  };
  const component = interactor.stager.component;
  if (!data || !component) return;
  if (data.type === "entitylist") {
    const entityListData = data as {
      type: "entitylist";
      entities: EntityData[];
    };
    const selection = interactor.interactionManager.selection;
    const targets = selection.length
      ? selection
      : interactor.fallback
      ? [interactor.fallback]
      : [];
    if (!targets.length) return;
    const entities = entityListData.entities.map((entityData) => {
      const entity = component.createEntity({
        type: entityData.type,
      });
      entity.restore(entityData);
      return entity;
    });
    targets.forEach((target) => {
      target.handleEntityDrop(entities);
    });
  }
};

export const duplicate: CommandHandler = (interactor) => {
  const selection = interactor.interactionManager.selection.filter(
    (handle) => handle instanceof EntityHandle
  ) as EntityHandle[];
  if (selection.length === 0) return;
  const newHandles = duplicateEntityHandles(selection);
  interactor.interactionManager.select(newHandles);
};

export const undo: CommandHandler = (interactor) => {};

export const redo: CommandHandler = (interactor) => {};

export const deleteSelection: CommandHandler = (interactor) => {
  interactor.interactionManager.selection.forEach((handle) => {
    handle.delete();
  });
  interactor.interactionManager.clearSelection();
};

export const wrapSelection: CommandHandler = (interactor) => {
  const elementInstances = interactor.interactionManager.selection.filter(
    (handle) => handle instanceof ElementHandle
  ) as ElementHandle[];
  if (elementInstances.length === 0) return;
  wrapElements(elementInstances);
};

export const unwrapSelection: CommandHandler = (interactor) => {
  const containerInstances = interactor.interactionManager.selection.filter(
    (instance) => instance instanceof ContainerElementHandle
  ) as ContainerElementHandle[];

  if (containerInstances.length === 0) return;

  const children = unwrapElements(containerInstances);
  if (children) {
    interactor.interactionManager.select(children);
  }
};

export const moveUp: CommandHandler = (interactor) => {
  handleMove(interactor, { x: 0, y: -1 });
};

export const moveDown: CommandHandler = (interactor) => {
  handleMove(interactor, { x: 0, y: 1 });
};

export const moveLeft: CommandHandler = (interactor) => {
  handleMove(interactor, { x: -1, y: 0 });
};

export const moveRight: CommandHandler = (interactor) => {
  handleMove(interactor, { x: 1, y: 0 });
};

export const moveForward: CommandHandler = (interactor) => {
  handleMoveZIndex(interactor, 1);
};

export const moveBackward: CommandHandler = (interactor) => {
  handleMoveZIndex(interactor, -1);
};
