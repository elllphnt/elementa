import { ElementaStageRenderable } from "@elllphnt/elementa-scene";
import { Lifecycle } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { FrameHandle } from "../handles/_.js";
import { Handle } from "./handles/_.js";
import {
  IInteractionManager,
  IInterface,
  IMarkerManager,
  IToolManager,
} from "./managers/_.js";

export interface ElementaInteractor extends Lifecycle {
  readonly stage: ElementaStageRenderable;
  readonly interface: IInterface;
  readonly interactionManager: IInteractionManager;
  readonly toolManager: IToolManager;
  readonly fallback: Handle;
  readonly markerManager: IMarkerManager;
  // readonly commandManager: ICommandManager;
  // readonly keyboardManager: IKeyboardManager;

  // get flags(): Record<string, boolean>;
  // get flags$(): Observable<Record<string, boolean>>;

  // flag(key: string): boolean;
  // flag$(key: string): Observable<boolean>;

  frames: FrameHandle[];
  frames$: Observable<FrameHandle[]>;

  // setFlag(key: string, value: boolean): void;

  // handles
  handles: Handle[];
  registerHandle(handle: Handle): void;
  unregisterHandle(handle: Handle): void;

  // // entity handles
  // entityHandles(entity: Entity): IEntityHandle[];
  // registerEntityHandle(handle: IEntityHandle): void;
  // unregisterEntityHandle(handle: IEntityHandle): void;
}
