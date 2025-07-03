import type {
  ComponentRenderable,
  ComponentRenderableContentRenderable,
  FragmentRenderable,
  FragmentRenderableContentRenderable,
  RenderableContentRenderable,
  RouterRenderable,
  RouterRenderableContentRenderable,
} from "@elllphnt/elementa-scene";
import { BehaviorSubject } from "rxjs";
import type { ElementaInteractor } from "~/interactor.js";
import type { Handle } from "../handle.js";
import { ComponentHandle } from "./component.js";
import { FragmentHandle } from "./fragment.js";
import { RenderableHandle } from "./renderable.js";
import { RouterHandle } from "./router.js";

export type ContentRenderable =
  | ComponentRenderable
  | RouterRenderable
  | FragmentRenderable;
export type ContentHandle = ComponentHandle | RouterHandle | FragmentHandle;

export class RenderableContentHandle extends RenderableHandle<RenderableContentRenderable> {
  private _content$ = new BehaviorSubject<ContentHandle | undefined>(undefined);

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  constructor({
    interactor,
    renderable,
    parent,
  }: {
    interactor: ElementaInteractor;
    renderable: RenderableContentRenderable;
    parent: Handle | null;
  }) {
    super({
      id: [parent?.id, "content"].filter(Boolean).join("."),
      renderable,
      interactor,
      parent,
    });

    const handleRenderableContent = <
      R extends ContentRenderable,
      H extends ContentHandle
    >({
      renderable,
      create,
    }: {
      renderable?: R;
      create: (renderable: R) => H;
    }) => {
      const current = this._content$.value;
      if (current?.renderable === renderable) return;
      else if (renderable) {
        const newContent = create(renderable);
        this._content$.next(newContent);
      } else {
        this._content$.next(undefined);
      }
      current?.dispose();
    };

    switch (renderable.instance.model.type) {
      case "router":
        (
          this.renderable as RouterRenderableContentRenderable
        ).routerContent$.subscribe((router) => {
          handleRenderableContent({
            renderable: router,
            create: (r) =>
              new RouterHandle({ interactor, renderable: r, parent: this }),
          });
        });
        break;
      case "component":
        (
          this.renderable as ComponentRenderableContentRenderable
        ).componentContent$.subscribe((component) => {
          handleRenderableContent({
            renderable: component,
            create: (r) =>
              new ComponentHandle({ interactor, renderable: r, parent: this }),
          });
        });
        break;
      case "fragment":
        (
          this.renderable as FragmentRenderableContentRenderable
        ).fragmentContent$.subscribe((fragment) => {
          handleRenderableContent({
            renderable: fragment,
            create: (r) =>
              new FragmentHandle({ interactor, renderable: r, parent: this }),
          });
        });
        break;
      default:
        throw new Error(
          `Unsupported renderable content type: ${
            (renderable.instance.model as any).type
          }`
        );
    }
  }

  delete(): void {
    throw new Error("Method not implemented.");
  }
}
