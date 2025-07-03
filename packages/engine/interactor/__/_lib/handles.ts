import { entityTypes, switchEntityType } from "@elllphnt/elementa-base";
import type {
  ComponentElementRenderable,
  ContainerElementRenderable,
  FragmentRenderable,
  MediaElementRenderable,
  PrimitiveElementRenderable,
  SlotElementRenderable,
  TextElementRenderable,
  VectorElementRenderable,
} from "@elllphnt/elementa-scene";
import { updateMapList } from "@elllphnt/elementa-utils";
import { ElementaInteractor } from "../_types/_.js";
import {
  ComponentElementHandle,
  ElementHandle,
  FragmentHandle,
  MediaElementHandle,
  PrimitiveElementHandle,
} from "../handles/_.js";
import { ContainerElementHandle } from "../handles/elements/container.js";
import { SlotElementHandle } from "../handles/elements/slot.js";
import { TextElementHandle } from "../handles/elements/text/text.js";
import { VectorElementHandle } from "../handles/elements/vector.js";
import { FrameWidgetHandle } from "../handles/entities/widgets/frame.js";
import { Handle } from "../handles/handle.js";

export const makeElementHandle: ElementaInteractor["makeElementHandle"] =
  function ({ renderable, fragment, parent }) {
    return switchEntityType<ElementHandle<any>>(
      renderable.instance.entity.type,
      {
        [entityTypes.elements.component]: () => {
          return new ComponentElementHandle({
            fragment,
            renderable: renderable as unknown as ComponentElementRenderable,
            parent,
          }) as any;
        },
        [entityTypes.elements.primitive]: () => {
          return new PrimitiveElementHandle({
            fragment,
            renderable: renderable as unknown as PrimitiveElementRenderable,
            parent,
          }) as any;
        },
        [entityTypes.elements.container]: () => {
          return new ContainerElementHandle({
            fragment,
            renderable: renderable as unknown as ContainerElementRenderable,
            parent,
          }) as any;
        },
        [entityTypes.elements.slot]: () => {
          return new SlotElementHandle({
            fragment,
            renderable: renderable as unknown as SlotElementRenderable,
            parent,
          }) as any;
        },
        [entityTypes.elements.text]: () => {
          return new TextElementHandle({
            fragment,
            renderable: renderable as unknown as TextElementRenderable,
            parent,
          }) as any;
        },
        [entityTypes.elements.vector]: () => {
          return new VectorElementHandle({
            fragment,
            renderable: renderable as unknown as VectorElementRenderable,
            parent,
          }) as any;
        },
        [entityTypes.elements.media]: () => {
          return new MediaElementHandle({
            fragment,
            renderable: renderable as unknown as MediaElementRenderable,
            parent,
          }) as any;
        },
      }
    );
  };

export const makeInstanceHandle: ElementaInteractor["makeInstanceHandle"] =
  function ({ renderable, interactor, parent }) {
    return switchEntityType(renderable.instance.entity.type, {
      // widgets
      [entityTypes.widgets.frame]: () => {
        return new FrameWidgetHandle({
          interactor: interactor,
          renderable: renderable as unknown as FrameWidgetRenderable,
          parent,
        });
      },
      // fragment
      [entityTypes.fragment]: () => {
        return new FragmentHandle({
          interactor: interactor,
          renderable: renderable as unknown as FragmentRenderable,
          parent,
        }) as any;
      },
    }) as unknown as Handle;
  };

export const updateEntityHandleList: ElementaInteractor["updateEntityHandleList"] =
  function ({ handles, renderables, ...args }) {
    let _create: (renderable: any) => any;
    if ("interactor" in args) {
      const parent = args.parent;
      _create = (renderable: any) =>
        makeInstanceHandle({
          renderable,
          interactor: args.interactor as any,
          parent,
        });
    } else {
      _create = args.create;
    }

    return updateMapList({
      sources: renderables,
      targets: handles,
      create: _create,
      ref: (handle) => handle.renderable,
      dispose: (handle) => handle.dispose(),
    });
  };
