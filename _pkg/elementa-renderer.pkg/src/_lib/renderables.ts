import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import {
  CodeComponentElementInstance,
  ContainerElementInstance,
  ElllComponentElementInstance,
  FragmentInstance,
  FrameWidgetInstance,
  Instance,
  MediaElementInstance,
  PageElementInstance,
  SlotElementInstance,
  TextElementInstance,
  VectorElementInstance,
} from "@repo/elementa";
import { updateMapList } from "@repo/utils";
import { ElementaRenderer } from "../elementa_renderer";
import {
  FragmentRenderable,
  MediaElementRenderable,
} from "../renderables/instances/_";
import { CodeComponentElementRenderable } from "../renderables/instances/element/components/code_component";
import { ElllComponentElementRenderable } from "../renderables/instances/element/components/elll_component";
import { ContainerElementRenderable } from "../renderables/instances/element/container";
import { PageElementRenderable } from "../renderables/instances/element/page";
import { SlotElementRenderable } from "../renderables/instances/element/slot";
import { TextElementRenderable } from "../renderables/instances/element/text";
import { VectorElementRenderable } from "../renderables/instances/element/vector";
import { InstanceRenderable } from "../renderables/instances/instance";
import { FrameWidgetRenderable } from "../renderables/instances/widgets/frame";

export function makeInstanceRenderable<I extends Instance>({
  instance,
  renderer,
}: {
  instance: I;
  renderer: ElementaRenderer;
}): InstanceRenderable<I> {
  return switchEntityType(instance.entity.type, {
    // widgets
    [entityTypes.widgets.frame]: () => {
      return new FrameWidgetRenderable({
        renderer,
        instance: instance as unknown as FrameWidgetInstance,
      });
    },

    // element
    [entityTypes.elements.components.elll]: () => {
      return new ElllComponentElementRenderable({
        renderer,
        instance: instance as unknown as ElllComponentElementInstance,
      }) as any;
    },
    [entityTypes.elements.components.code]: () => {
      return new CodeComponentElementRenderable({
        renderer,
        instance: instance as unknown as CodeComponentElementInstance,
      }) as any;
    },
    [entityTypes.elements.page]: () => {
      return new PageElementRenderable({
        renderer,
        instance: instance as unknown as PageElementInstance,
      }) as any;
    },
    [entityTypes.elements.container]: () => {
      return new ContainerElementRenderable({
        renderer,
        instance: instance as unknown as ContainerElementInstance,
      }) as any;
    },
    [entityTypes.elements.slot]: () => {
      return new SlotElementRenderable({
        renderer,
        instance: instance as unknown as SlotElementInstance,
      }) as any;
    },
    [entityTypes.elements.text]: () => {
      return new TextElementRenderable({
        renderer,
        instance: instance as unknown as TextElementInstance,
      }) as any;
    },
    [entityTypes.elements.vector]: () => {
      return new VectorElementRenderable({
        renderer,
        instance: instance as unknown as VectorElementInstance,
      }) as any;
    },
    [entityTypes.elements.media]: () => {
      return new MediaElementRenderable({
        renderer,
        instance: instance as unknown as MediaElementInstance,
      }) as any;
    },

    // fragment
    [entityTypes.fragment]: () => {
      return new FragmentRenderable({
        renderer,
        instance: instance as unknown as FragmentInstance,
      }) as any;
    },
  }) as unknown as InstanceRenderable<I>;
}
export function updateInstanceRenderableList<
  I extends Instance,
  R extends InstanceRenderable<I>,
>({
  renderables,
  instances,
  renderer,
}: {
  renderables: R[];
  instances: I[];
  renderer: ElementaRenderer;
}): R[] {
  return updateMapList({
    sources: instances,
    targets: renderables,
    create: (instance) =>
      makeInstanceRenderable({
        instance,
        renderer,
      }) as unknown as R,
    ref: (renderable) => renderable.instance as I,
    dispose: (renderable) => renderable.dispose(),
  });
}
