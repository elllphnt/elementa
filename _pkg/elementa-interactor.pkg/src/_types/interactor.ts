import { Entity } from "@repo/elementa-models";
import { ElementRenderable, InstanceRenderable } from "@repo/elementa-renderer";
import { ElementaStager } from "@repo/elementa-stager";
import { Disposable } from "@repo/utils";
import { Observable } from "rxjs";
import { FrameWidgetHandle } from "../handles/_";
import {
  IElementHandle,
  IEntityHandle,
  IFragmentHandle,
  IHandle,
  IInteractionManager,
  IInterface,
  IMarkerManager,
  IToolManager,
} from "./_";
import { IHost } from "./host";
import { ICommandManager } from "./managers/command";
import { IKeyboardManager } from "./managers/keyboard";

export interface IElementaInteractor extends Disposable {
  readonly stager: ElementaStager;
  readonly interactionManager: IInteractionManager;
  readonly commandManager: ICommandManager;
  readonly keyboardManager: IKeyboardManager;
  readonly toolManager: IToolManager;
  readonly markerManager: IMarkerManager;
  readonly interface: IInterface;
  readonly fallback: IHandle;
  readonly host: IHost;

  get flags(): Record<string, boolean>;
  get flags$(): Observable<Record<string, boolean>>;

  flag(key: string): boolean;
  flag$(key: string): Observable<boolean>;

  frames: FrameWidgetHandle[];
  frames$: Observable<FrameWidgetHandle[]>;

  setFlag(key: string, value: boolean): void;

  // handles
  handles: IHandle[];
  registerHandle(handle: IHandle): void;
  unregisterHandle(handle: IHandle): void;

  // entity handles
  entityHandles(entity: Entity): IEntityHandle[];
  registerEntityHandle(handle: IEntityHandle): void;
  unregisterEntityHandle(handle: IEntityHandle): void;

  makeElementHandle<I extends ElementRenderable>({
    renderable,
    fragment,
    parent,
  }: {
    renderable: I;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }): IElementHandle<I>;
  makeInstanceHandle<I extends InstanceRenderable>({
    renderable,
    interactor,
    parent,
  }: {
    renderable: I;
    interactor: IElementaInteractor;
    parent: IHandle | null;
  }): IHandle;
  updateEntityHandleList<
    I extends InstanceRenderable,
    R extends IEntityHandle<I>,
  >({
    handles,
    renderables,
    ...args
  }: {
    handles: R[];
    renderables: I[];
  } & (
    | {
        parent: IHandle | null;
        interactor: IElementaInteractor;
      }
    | {
        create: (renderable: I) => R;
      }
  )): R[];
}
