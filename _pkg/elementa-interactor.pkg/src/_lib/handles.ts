import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import {
  ComponentElementRenderable,
  ContainerElementRenderable,
  FragmentRenderable,
  FrameWidgetRenderable,
  MediaElementRenderable,
  PageElementRenderable,
  PrimitiveElementRenderable,
  SlotElementRenderable,
  TextElementRenderable,
  VectorElementRenderable,
} from "@repo/elementa-renderer";
import { updateMapList } from "@repo/utils";
import { IElementaInteractor } from "../_types/_";
import {
  ComponentElementHandle,
  ElementHandle,
  FragmentHandle,
  MediaElementHandle,
  PrimitiveElementHandle,
} from "../handles/_";
import { ContainerElementHandle } from "../handles/entities/elements/container";
import { PageElementHandle } from "../handles/entities/elements/page";
import { SlotElementHandle } from "../handles/entities/elements/slot";
import { TextElementHandle } from "../handles/entities/elements/text/text";
import { VectorElementHandle } from "../handles/entities/elements/vector";
import { FrameWidgetHandle } from "../handles/entities/widgets/frame";
import { Handle } from "../handles/handle";

export const makeElementHandle: IElementaInteractor["makeElementHandle"] =
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
        [entityTypes.elements.page]: () => {
          return new PageElementHandle({
            fragment,
            renderable: renderable as unknown as PageElementRenderable,
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
      },
    );
  };

export const makeInstanceHandle: IElementaInteractor["makeInstanceHandle"] =
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

export const updateEntityHandleList: IElementaInteractor["updateEntityHandleList"] =
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
