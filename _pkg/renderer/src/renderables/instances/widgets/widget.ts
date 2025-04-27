import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { WidgetInstance } from "@repo/elementa";
import { ElementaRenderer } from "../../../elementa_renderer";
import { Renderable } from "../_";
import { InstanceRenderable } from "../instance";

export abstract class WidgetRenderable<
  W extends WidgetInstance = WidgetInstance
> extends InstanceRenderable<W> {
  constructor({
    instance,
    renderer,
  }: {
    instance: W;
    renderer: ElementaRenderer;
  }) {
    super({ instance, renderer });

    // sync htmlElement style with entity properties
    const styleSubscription = combineLatestOrEmpty([
      this.instance.entity.x$,
      this.instance.entity.y$,
      this.instance.entity.scale$,
      this.htmlElements$,
    ]).subscribe(([x, y, scale, htmlElements]) => {
      const element = htmlElements[Renderable.defaultHtmlElementKey];
      if (!element) return;

      element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      element.style.transformOrigin = "top left";
    });

    this.addDisposer(() => {
      styleSubscription.unsubscribe();
    });
  }
}
