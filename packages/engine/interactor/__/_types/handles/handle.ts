import { EdgeName } from "@elllphnt/elementa-base";
import { Lifecycle, Rect } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { EventListenerData } from "~/handles/_";
import { ElementaInteractor } from "../interactor.js";
import { IHandleRect, ILayoutUpdatePropagation } from "./handle_rect.js";

export type DropOptions = {
  position?: { x: number; y: number };
  index?: number;
  autoSelect?: boolean;
};

export interface Handle extends Lifecycle {
  readonly key: string;
  readonly id: string;
  readonly type: string;
  readonly parent: Handle | undefined;
  readonly interactor: ElementaInteractor;
  readonly allowedDropTypes: string[];

  readonly path: string[];
  descendantOf(handle: Handle): boolean;

  property<T>(name: string): T | undefined;
  property$<T>(name: string): Observable<T | undefined>;

  readonly allowedPortPlacements: EdgeName[];
  readonly allowedPortPlacements$: Observable<EdgeName[]>;

  readonly partKey: string | undefined;
  readonly partKey$: Observable<string | undefined>;

  readonly zIndex$: Observable<number>;
  readonly zIndex: number;

  readonly rects$: Observable<Record<string, IHandleRect>>;
  readonly rects: Record<string, IHandleRect>;

  rectHtmlElement$(key: string): Observable<HTMLElement | undefined>;
  rectHtmlElement(key: string): HTMLElement | undefined;

  contentHtmlElement$(key: string): Observable<HTMLElement | undefined>;
  contentHtmlElement(key: string): HTMLElement | undefined;

  readonly listeners$: Observable<EventListenerData[]>;
  readonly listeners: EventListenerData[];

  readonly contentRect$: Observable<Rect | undefined>;
  readonly contentRect: Rect | undefined;

  readonly interfaceRect$: Observable<Rect | undefined>;
  readonly interfaceRect: Rect | undefined;

  readonly hovered$: Observable<boolean>;
  readonly hovered: boolean;

  readonly selected$: Observable<boolean>;
  readonly selected: boolean;

  readonly isDropTarget$: Observable<boolean>;
  readonly isDropTarget: boolean;

  readonly active$: Observable<boolean>;
  readonly active: boolean;

  readonly hasSelection$: Observable<boolean>;
  readonly hasSelection: boolean;

  readonly focused$: Observable<boolean>;
  readonly focused: boolean;

  readonly children$: Observable<Handle[]>;
  readonly children: Handle[];

  setProperty(name: string, value: any): void;
  select(options?: { toggle?: boolean }): void;
  deselect(): void;
  hover(): void;
  unhover(): void;
  focus(): void;
  blur(): void;

  addInteractionTarget(target: HTMLElement): void;
  removeInteractionTarget(target: HTMLElement): void;
  addEventListener<t extends keyof HTMLElementEventMap>(
    type: t,
    listener: (
      event: HTMLElementEventMap[t],
      options?: boolean | AddEventListenerOptions
    ) => void
  ): void;

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: ILayoutUpdatePropagation;
  }): void;

  // entities
  // entityHandle(entity: Entity): Handle | undefined;

  // editing
  delete(): void;

  // drag and drop
  // resolveDropTarget({
  //   datatypes,
  // }: {
  //   datatypes: string[];
  // }): Handle | undefined;
  // handleEntityDrop(entities: Entity[], options?: DropOptions): Handle[];
  // handleDrop(data: Record<string, any>, options?: DropOptions): Handle[];
}
