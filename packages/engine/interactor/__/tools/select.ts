import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import {
  PointData,
  Rect,
  VectorData,
  nearestPointIndex,
} from "@elllphnt/elementa-math-utils";
import { Element } from "@elllphnt/elementa-models";
import { makeEntityDropType } from "~/_lib/droptypes.js";
import { duplicateEntityHandles } from "~/_lib/editing/duplicate.js";
import { Handle } from "~/_types/handles/handle.js";
import { IMovableHandle } from "~/_types/handles/properties/movable.js";
import { RenderableHandle } from "~/_types/handles/renderable/renderable.js";
import { handleProperties } from "~/handles/_libs/properties.js";
import { FallbackHandle } from "~/handles/fallback.js";
import { ElementHandle } from "~/handles/renderables/elements/element.js";
import { ElementaInteractor } from "~/interactor.js";
import { PointerEvent, Tool } from "~/primitives/tool.js";
import { createDragInteraction } from "./interactions/drag.js";
import { MouseInteraction } from "./interactions/mouse.js";
import { createRectDrawInteraction } from "./interactions/rect_draw.js";
import { createDragImages } from "./interactions/utils.js";

export class SelectTool extends Tool {
  constructor() {
    super({ name: "Select" });
  }

  startSelection(event: PointerEvent) {
    const { interactor, position } = event;

    const handles = interactor.handles;
    const initialSelection = interactor.interactionManager.selection;

    const interaction = createRectDrawInteraction({
      interactor: interactor as ElementaInteractor,
      onUpdate: (rect, keys) => {
        const toggle = keys.shift;

        const selectionRect = new Rect(rect);
        const selectedInstances = handles.filter((handle) => {
          const instanceRect = handle.interfaceRect;
          if (!instanceRect) return;
          return selectionRect.containsRect(instanceRect);
        });

        if (toggle) {
          const newSelection = new Set(initialSelection);
          for (const instance of selectedInstances) {
            if (newSelection.has(instance)) {
              newSelection.delete(instance);
            } else {
              newSelection.add(instance);
            }
          }
          interactor.interactionManager.select([...newSelection]);
        } else {
          interactor.interactionManager.select(selectedInstances);
        }
      },
      flag: "selecting",
    });

    interaction.run(window, position);
  }

  /**
   * This function creates a move interaction for a list of movable instances.
   * When the user starts moving the instances, the initial positions of the instances are stored.
   * As the user moves the instances, the delta position is calculated and the instances positions are updated.
   * When the user stops moving the instances, the delta position subscription is disposed.
   *
   * Duplication handling:
   * While moving the instances, the user can hold the alt key to duplicate the instances.
   * When the user holds the alt key, copies of the DOM elements are created and moved instead of the original elements.
   * The positions of the original elements are reset to their initial values.
   * When the user stops moving the instances, the copies are removed, and actual clones of the instances are created at the new positions.
   */
  startMove(
    event: PointerEvent,
    handles: (IMovableHandle & RenderableHandle)[]
  ) {
    const initialRects = new Map<Handle, Rect>();
    let isCloning = false;
    const clones = new Map<Handle, HTMLElement[] | undefined>();
    let delta: VectorData = {
      x: 0,
      y: 0,
    };

    const storeInitialRects = () => {
      initialRects.clear();
      handles.forEach((handle) => {
        initialRects.set(handle, handle.contentRect ?? new Rect());
      });
    };
    const updateDelta = (newDelta: VectorData) => {
      delta = newDelta;
    };

    // entity related functions
    const updateHandles = () => {
      handles.forEach((handle) => {
        const initialRect = initialRects.get(handle);
        if (initialRect) {
          const rect = initialRect.offset(delta);
          handle.setPosition(rect.topLeft);
        }
      });
    };
    const resetHandles = () => {
      handles.forEach((handle) => {
        const initialRect = initialRects.get(handle);
        if (initialRect) {
          handle.setPosition(initialRect.topLeft);
        }
      });
    };

    // clone related functions
    const getImages = (handle: RenderableHandle) => {
      let images = clones.get(handle);
      if (!images) {
        images = createDragImages(handle);
        clones.set(handle, images);
      }
      return images;
    };
    const updateClone = () => {
      handles.forEach((handle) => {
        const images = getImages(handle);
        images.forEach((image) => {
          image.style.transform = `translate(${delta.x}px, ${delta.y}px)`;
          image.style.visibility = "visible";
        });
      });
    };
    const resetClones = () => {
      handles.forEach((handle) => {
        const images = getImages(handle);
        images.forEach((image) => {
          image.style.transform = "";
          image.style.visibility = "hidden";
        });
      });
    };
    const removeClones = () => {
      handles.forEach((handle) => {
        const images = clones.get(handle);
        if (images) {
          images.forEach((image) => {
            image.remove();
          });
        }
      });
      clones.clear();
    };

    // duplicate related functions
    const createDuplicates = () => {
      // duplicate handles
      const newHandles = duplicateEntityHandles(
        handles
      ) as unknown as (RenderableHandle & IMovableHandle)[];
      newHandles.forEach((newHandle, i) => {
        const initialRect = initialRects.get(handles[i]);
        if (initialRect) {
          const newRect = initialRect.offset(delta);
          newHandle.setPosition(newRect.topLeft);
        }
      });

      // select the new handles
      event.interactor.interactionManager.select(newHandles);
    };

    // create a mouse interaction to handle the move interaction
    const mouseInteraction = new MouseInteraction();
    mouseInteraction?.on("start", () => {
      event.interactor.interactionManager.select(handles);

      // set the moving flag to true to prevent other interactions
      // and store the initial positions of the instances
      event.interactor.setFlag("moving", true);
      storeInitialRects();

      // subscribe to the delta position of the mouse interaction
      // to update the positions of the instances or clones as the user moves the mouse.
      const deltaSubscription = combineLatestOrEmpty([
        mouseInteraction?.deltaPosition$,
        mouseInteraction?.altKey$,
      ]).subscribe(([delta, alt]) => {
        const contentDelta =
          event.interactor.stager.viewport.vectorViewportToContent(delta);
        updateDelta(contentDelta);

        if (alt) {
          isCloning = true;
          // reset the positions of the original instances
          resetHandles();
          // the user is trying to duplicate the instances
          // update the positions of the clones
          // this function will also ensure the clones are created if they don't exist
          updateClone();
        } else {
          isCloning = false;
          // the user is moving the instances without duplication
          // update the positions of the original instances
          updateHandles();
          // reset the positions of the clones
          resetClones();
        }
      });

      // subscribe to the stop event of the mouse interaction
      // to clean up the move interaction
      mouseInteraction?.on("stop", () => {
        deltaSubscription?.unsubscribe();
        mouseInteraction?.dispose();

        // clean up the clones and create duplicates of the instances if needed
        removeClones();
        if (isCloning) {
          createDuplicates();
        }

        // set the moving flag to false to allow other interactions
        setTimeout(() => {
          event.interactor.setFlag("moving", false);
        });
      });
    });

    mouseInteraction?.run(window, event.position);
  }

  /**
   * This function creates a drag interaction for a list of draggable elements.
   *
   */
  startDragElementsOfContainer(
    event: PointerEvent,
    container: Handle,
    draggables: ElementHandle[]
  ) {
    const initialChildren = container.children as ElementHandle[];
    const centers: PointData[] = [];
    const edges: PointData[] = [];
    let lastBottomRight: PointData | undefined = undefined;
    let outOfContainer = false;

    initialChildren.forEach((child, index) => {
      if (child.property(handleProperties.isDraggable)) {
        const rect = child.contentRect ?? new Rect();
        centers[index] = rect.center;

        edges[index] = rect.topLeft;
        if (!lastBottomRight) {
          lastBottomRight = rect.bottomRight;
          edges[index + 1] = lastBottomRight;
        } else {
          const gap = {
            x: rect.topLeft.x - lastBottomRight.x,
            y: rect.topLeft.y - lastBottomRight.y,
          };
          lastBottomRight = {
            x: rect.bottomRight.x + gap.x,
            y: rect.bottomRight.y + gap.y,
          };
          edges[index + 1] = lastBottomRight;
        }
      } else {
        // put the absolutely positioned elements as far as possible
        // so they don't get selected as the nearest index
        centers[index] = {
          x: Number.MAX_SAFE_INTEGER,
          y: Number.MAX_SAFE_INTEGER,
        };
        if (!edges[index]) {
          // make sure to not overwrite the draggable elements
          edges[index] = {
            x: Number.MAX_SAFE_INTEGER,
            y: Number.MAX_SAFE_INTEGER,
          };
        }
      }
    });

    const entities = draggables.map((d) => d.entity);
    let clones: Element[] | undefined = undefined;
    let latestIndex: number | undefined;

    const handleClones = (clone: boolean) => {
      if (clone && !clones) {
        clones = entities.map((entity) => {
          const clone = entity.clone() as Element;
          const index = initialChildren.findIndex(
            (child) => child.entity === entity
          );
          container.handleEntityDrop([clone], {
            index,
          });
          return clone;
        });
      } else if (!clone && clones) {
        clones.forEach((clone) => {
          clone.remove();
          clone.dispose();
        });
        clones = undefined;
      }
    };

    const handleInContainerUpdate = (
      interfacePosition: PointData,
      keys: {
        ctrl: boolean;
        alt: boolean;
        shift: boolean;
      }
    ) => {
      const clone = keys.alt;
      handleClones(clone);

      const position =
        event.interactor.stager.viewport.viewportToContent(interfacePosition);
      const nearestIndex = nearestPointIndex(position, clone ? edges : centers);

      if (nearestIndex !== latestIndex) {
        container.handleEntityDrop(entities, {
          position,
          index: nearestIndex,
        });
        latestIndex = nearestIndex;
      }
    };

    const interaction = createDragInteraction({
      interactor: event.interactor,
      draggables: draggables,
      onStart: () => {
        event.interactor.interactionManager.select(draggables);
      },
      onUpdate: (interfacePosition, keys) => {
        if (keys.ctrl) {
          const hovered = event.interactor.interactionManager.hovered;
          let target: Handle;
          if (
            hovered &&
            !(
              hovered instanceof EntityHandle &&
              entities.includes(hovered.entity)
            )
          ) {
            target = hovered;
          } else {
            target = event.interactor.fallback;
          }
          event.interactor.interactionManager.setDropCase({
            target,
            datatypes: _.uniq(draggables.map((d) => d.entity.type)).map(
              makeEntityDropType
            ),
          });
          outOfContainer = true;
        } else {
          outOfContainer = false;
          event.interactor.interactionManager.clearDropCase();
          handleInContainerUpdate(interfacePosition, keys);
        }
      },
      onDrop: (interfacePosition) => {
        if (outOfContainer) {
          const dropTarget = event.interactor.interactionManager.dropTarget;
          const stagerPosition =
            event.interactor.interface.interactorToStager(interfacePosition);
          const contentPosition =
            event.interactor.stager.viewport.viewportToContent(stagerPosition);

          if (dropTarget) {
            entities.forEach((entity) => {
              entity.remove();
            });
            const handles = dropTarget.handleEntityDrop(entities, {
              position: contentPosition,
              index: latestIndex,
            });
            event.interactor.interactionManager.select(handles);
          }
        }
        event.interactor.interactionManager.clearDropCase();
      },
    });

    interaction.run(window, event.position);
  }

  /**
   * Makes sure all draggables are elements and they all belong to the same container
   */
  startDrag(event: PointerEvent, draggables: Handle[]) {
    let parent = draggables[0]?.parent;
    for (let i = 1; i < draggables.length && parent; ++i) {
      const draggable = draggables[i];
      if (draggable.parent !== parent) {
        parent = undefined;
      }
    }

    if (draggables.every((d) => d instanceof ElementHandle)) {
      return this.startDragElementsOfContainer(
        event,
        parent as any,
        draggables as any
      );
    }
  }

  /**
   * Starts a move if at least one of the instances is movable otherwise starts a drag
   */
  startDragOrMove(event: PointerEvent) {
    // If the mouse is inside the selection rectangle, the user is trying to move the selection
    // otherwise the user is trying to drag the targeted instance
    const selectionRect = Rect.union(
      event.interactor.interactionManager.selection
        .map((instance) => instance.interfaceRect)
        .filter(Boolean) as Rect[]
    );
    const instances = selectionRect.containsPoint(
      event.interactor.interface.windowToInterface(event.position)
    )
      ? event.interactor.interactionManager.selection
      : [event.target];

    // If at least one of the instances is movable, start a move interaction
    const movables = instances.filter(
      (instance) =>
        instance.property(handleProperties.isMovable) &&
        instance instanceof EntityHandle
    ) as (IMovableHandle & RenderableHandle)[];
    if (movables.length) {
      return this.startMove(event, movables);
    }

    // Otherwise, if at least one of the instances is draggable, start a drag interaction
    const draggables = instances.filter((instance) =>
      instance.property(handleProperties.isDraggable)
    );

    if (draggables.length) {
      return this.startDrag(event, draggables);
    }
  }

  down(event: PointerEvent) {
    // If the target instance is the canvas or the user is holding the ctrl key, start a selection
    if (event.target instanceof FallbackHandle) {
      this.startSelection(event);
      return true;
    } else if (event.keys.ctrl) {
      this.startSelection(event);
      return true;
    }

    // Otherwise, start a move or drag interaction
    this.startDragOrMove(event);
  }

  tap(event: PointerEvent): boolean {
    const { interactor: editor, target, keys } = event;
    if (target instanceof FallbackHandle) {
      if (editor.interactionManager.focused) {
        editor.interactionManager.clearFocus();
      } else {
        editor.interactionManager.clearSelection();
      }
    } else {
      editor.interactionManager.select([target], { toggle: keys.shift });
    }

    return true;
  }
}
