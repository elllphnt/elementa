import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { Instance } from "@repo/elementa";
import { map } from "rxjs";
import { ElementaRenderer } from "~/src/elementa_renderer";
import { Renderable } from "../renderable";

export abstract class InstanceRenderable<
  I extends Instance = Instance
> extends Renderable {
  readonly instance: I;

  get entity() {
    return this.instance.entity as I["entity"];
  }

  get ready() {
    const htmls = Object.values(this.htmlElements);
    return !!htmls.length && htmls.every(Boolean);
  }
  get ready$() {
    return this.htmlElements$.pipe(
      map((elements) => {
        const htmls = Object.values(elements);
        return !!htmls.length && htmls.every(Boolean);
      })
    );
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: I;
  }) {
    super({
      renderer,
    });
    this.instance = instance;

    // placeholder subscription
    const placeholderSubscription = combineLatestOrEmpty([
      this.instance.flag$("placeholder"),
      this.htmlElements$,
    ]).subscribe(([placeholder, htmlElements]) => {
      if (placeholder) {
        Object.values(htmlElements).forEach((element) => {
          if (!element) return;
          if (element.dataset["placeholder_applied"]) return;

          for (const child of element.children) {
            const element = child as HTMLElement;
            element.dataset["elementa_initial_style"] =
              element.getAttribute("style") ?? "";
            (child as HTMLElement).style.visibility = "hidden";
          }

          element.dataset["elementa_initial_style"] =
            element.getAttribute("style") ?? "";

          element.style.setProperty("background", "#08f5");
          // element.style.backdropFilter = "invert(0.2)";
          element.style.opacity = "1";
          element.style.border = "none";
          element.style.outline = "none";
          element.style.boxShadow = "none";
          element.style.filter = "none";
          element.style.color = "transparent";

          element.dataset["placeholder_applied"] = "true";
        });
      } else {
        Object.values(this.htmlElements).forEach((element) => {
          if (!element) return;
          if (!element.dataset["placeholder_applied"]) return;

          for (const child of element.children) {
            const element = child as HTMLElement;
            element.setAttribute(
              "style",
              element.dataset["elementa_initial_style"] ?? ""
            );
            delete element.dataset["elementa_initial_style"];
          }

          element.setAttribute(
            "style",
            element.dataset["elementa_initial_style"] ?? ""
          );

          delete element.dataset["elementa_initial_style"];
          delete element.dataset["placeholder_applied"];
        });
      }
    });

    this.addDisposer(() => {
      placeholderSubscription.unsubscribe();
      this.renderables.forEach((renderable) => renderable.dispose());
    });
  }
}
