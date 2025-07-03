import { CornerName, EdgeName, PositionValue } from "@elllphnt/elementa-base";
import type { ElementRenderable } from "@elllphnt/elementa-scene";
import { PointData, RectData } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Handle } from "../../handle.js";
import { ICornerHandle } from "../../properties/corner.js";
import { IMovableHandle } from "../../properties/movable.js";
import { IResizableHandle } from "../../properties/resizable.js";
import { IFragmentHandle } from "../fragment.js";
import { RenderableHandle } from "../renderable.js";

export interface IElementHandle<R extends ElementRenderable = ElementRenderable>
  extends RenderableHandle<R>,
    IResizableHandle,
    ICornerHandle,
    IMovableHandle {
  readonly fragment: IFragmentHandle;

  readonly allowedPortPlacements: EdgeName[];
  readonly allowedPortPlacements$: Observable<EdgeName[]>;

  readonly style: any; // Replace with actual type

  readonly movable: boolean;
  readonly movable$: Observable<boolean>;

  readonly draggable: boolean;
  readonly draggable$: Observable<boolean>;

  readonly width: any; // Replace with actual type
  readonly width$: Observable<any>; // Replace with actual type

  readonly height: any; // Replace with actual type
  readonly height$: Observable<any>; // Replace with actual type

  corner<C extends CornerName>(name: C): number;
  corner$<C extends CornerName>(name: C): Observable<number>;
  padding<E extends EdgeName>(name: E): any; // Replace with actual type
  padding$<E extends EdgeName>(name: E): Observable<any>; // Replace with actual type

  resize(
    rect: RectData,
    options?: {
      x?: boolean;
      y?: boolean;
    }
  ): void;
  setCorner(name: CornerName, value: number | undefined): void;
  setPadding(name: EdgeName, value: number | undefined): void;
  setPosition(position: PointData): void;
  setPositionStrategy(position: PositionValue | undefined): void;
  ensurePositioned(): void;
  resolveContainingHandle(withPosition?: PositionValue): Handle | undefined;
}
