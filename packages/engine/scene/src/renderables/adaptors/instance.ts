import { Instance, InstanceAdaptor } from "@elllphnt/elementa-runtime";
import { InstanceRenderable } from "../instance.js";
import { RenderableAdaptor } from "./adaptor.js";

export class InstanceRenderableAdaptor<
  I extends Instance,
  R extends InstanceRenderable<I>,
  A extends InstanceAdaptor<I> = InstanceAdaptor<I>
> extends RenderableAdaptor<R> {
  readonly instanceAdaptor: A;

  constructor({
    instanceAdaptor,
    create,
  }: {
    instanceAdaptor: A;
    create: (instance: I) => R;
  }) {
    super();
    this.instanceAdaptor = instanceAdaptor;

    const instanceSubscription = this.instanceAdaptor.instance$.subscribe(
      (instance) => {
        const current = this.renderable;
        if (instance) {
          this.setRenderable(create(instance));
        } else {
          this.setRenderable(undefined);
        }
        current?.dispose();
      }
    );

    this.addDisposer(() => {
      instanceSubscription.unsubscribe();
    });
  }
}
