import { MediaElementInstance } from "@repo/elementa";
import { of } from "rxjs";
import { ElementRenderable } from "./element";

export class MediaElementRenderable<
  I extends MediaElementInstance = MediaElementInstance,
> extends ElementRenderable<I> {
  get renderables() {
    return [];
  }
  get renderables$() {
    return of([]);
  }
}
