import { Widget } from "@elllphnt/elementa-models";
import { of } from "rxjs";
import { Elementa } from "../../elementa";
import { Instance } from "../instance";

export abstract class WidgetInstance<
  W extends Widget = Widget
> extends Instance<W> {
  get movable() {
    return true;
  }
  get movable$() {
    return of(true);
  }

  get draggable() {
    return false;
  }
  get draggable$() {
    return of(false);
  }

  constructor({
    widget,
    elementa,
    parent,
  }: {
    widget: W;
    elementa: Elementa;
    parent: Instance | null;
  }) {
    super({
      entity: widget,
      elementa,
      parent,
    });
  }
}
