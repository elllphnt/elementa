import { Lifecycle, reconcileList } from "@elllphnt/elementa-kernel";
import type { ElementaStageRenderable } from "@elllphnt/elementa-scene";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from "rxjs";
import type { Handle } from "./_types/_.js";
import { ElementaInteractor } from "./_types/_.js";
import { FallbackHandle, FrameHandle } from "./handles/_.js";
import { Interface } from "./interface.js";
import { InteractionManager } from "./managers/interaction.js";
import { MarkerManager } from "./managers/marker.js";
import { ToolManager } from "./managers/tool_manager.js";

export class ElementaInteractor
  extends Lifecycle
  implements ElementaInteractor
{
  readonly stage: ElementaStageRenderable;
  readonly interface: Interface = new Interface({ interactor: this });
  readonly interactionManager = new InteractionManager();
  readonly toolManager = new ToolManager();
  readonly markerManager = new MarkerManager();
  readonly fallback: FallbackHandle;

  // readonly commandManager: CommandManager = new CommandManager({
  //   interactor: this,
  // });
  // readonly keyboardManager: KeyboardManager = new KeyboardManager({
  //   interactor: this,
  // });
  // readonly commandManager = new CommandManager({ elementa: this });
  // readonly keyboardManager = new KeyboardManager({ elementa: this });

  private _handles = new Map<string, Handle>();

  private _flags$ = new BehaviorSubject<Record<string, boolean>>({});
  private _frames$ = new BehaviorSubject<FrameHandle[]>([]);

  // private _properties$ = new BehaviorSubject<Record<string, any>>({});
  // private _entityHandles = new Map<Entity, IEntityHandle[]>();

  flags$ = this._flags$.asObservable();
  get flags() {
    return this._flags$.value;
  }

  flag(key: string) {
    return this._flags$.value[key] ?? false;
  }
  flag$(key: string) {
    return this._flags$.pipe(
      map((flags) => flags[key] ?? false),
      distinctUntilChanged()
    );
  }

  get handles() {
    return [...this._handles.values()];
  }
  handle(handleId: string) {
    return this._handles.get(handleId);
  }

  // handleFromPortRef(source: PortRef | undefined): Handle | undefined {
  //   if (!source) {
  //     return undefined;
  //   }

  //   const handle = this.handle(source.controllerId);
  //   if (handle instanceof ControllerWidgetHandle) {
  //     return handle.outputPort(source.path);
  //   } else {
  //     return handle;
  //   }
  // }
  // handleFromPortRef$(
  //   source: PortRef | undefined,
  // ): Observable<Handle | undefined> {
  //   if (!source) {
  //     return of(undefined);
  //   }
  //   return this.handle$(source.controllerId).pipe(
  //     switchMap((handle) => {
  //       if (handle instanceof ControllerWidgetHandle) {
  //         return handle.outputPort$(source.path);
  //       } else {
  //         return of(handle);
  //       }
  //     }),
  //   );
  // }

  // handleOf<E extends Entity>(entity: E): Handle<Renderable> | undefined {
  //   return this.handles.find((handle) => handle.entity === entity) as any;
  // }

  // get frameHandles() {
  //   return this.widgetHandles.filter(
  //     (handle) => handle.instance.entity.type === entityTypes.widgets.frame,
  //   ) as FrameWidgetHandle[];
  // }
  // get frameHandles$() {
  //   return this.widgetHandles$.pipe(
  //     map(
  //       (handles) =>
  //         handles.filter(
  //           (handle) =>
  //             handle.instance.entity.type === entityTypes.widgets.frame,
  //         ) as FrameWidgetHandle[],
  //     ),
  //   );
  // }

  // get controllerHandles() {
  //   return this.widgetHandles.filter((handle) =>
  //     entityTypeMatch(
  //       handle.instance.entity.type,
  //       entityTypes.widgets.controller,
  //     ),
  //   ) as ControllerWidgetHandle[];
  // }
  // get controllerHandles$() {
  //   return this.widgetHandles$.pipe(
  //     map(
  //       (handles) =>
  //         handles.filter((handle) =>
  //           entityTypeMatch(
  //             handle.instance.entity.type,
  //             entityTypes.widgets.controller,
  //           ),
  //         ) as ControllerWidgetHandle[],
  //     ),
  //   );
  // }

  frames$ = this._frames$.asObservable();
  get frames() {
    return this._frames$.value;
  }

  // get fallbackHandle() {
  //   return this._fallbackHandle$.value;
  // }
  // get fallbackHandle$() {
  //   return this._fallbackHandle$.asObservable();
  // }

  // get contentRect() {
  //   return Rect.union(
  //     this.widgetHandles.map((widget) => widget.contentRect) ?? [],
  //   );
  // }
  // get contentRect$() {
  //   return this.widgetHandles$.pipe(
  //     switchMap((widgets) =>
  //       combineLatestOrEmpty(widgets.map((widget) => widget.contentRect$)),
  //     ),
  //     map((rects) => Rect.union(rects)),
  //   );
  // }

  // property<T>(key: string) {
  //   return this._properties$.value[key] as T | undefined;
  // }
  // property$<T>(key: string) {
  //   return this._properties$.asObservable().pipe(
  //     map((properties) => properties[key] as T | undefined),
  //     distinctUntilChanged(),
  //   );
  // }

  // get selectionData() {
  //   return this.interactionManager.selection.map((handle) => handle.id);
  // }

  // get handles() {
  //   return Array.from(this._handles.values());
  // }
  // entityHandles(entity: Entity): IEntityHandle[] {
  //   return this._entityHandles.get(entity) ?? [];
  // }

  constructor({ stage }: { stage: ElementaStageRenderable }) {
    super();
    this.stage = stage;

    this.fallback = new FallbackHandle({ interactor: this, parent: null });

    const framesSubscription = combineLatest({
      ready: this.stage.ready$,
      frames: this.stage.frames$,
    }).subscribe(({ ready, frames }) => {
      const [nextFrames, removed] = reconcileList({
        sources: ready ? frames : [],
        targets: this.frames,
        sourceRef: (f) => f,
        targetRef: (f) => f.renderable,
        create: (frame) =>
          new FrameHandle({
            renderable: frame,
            interactor: this,
            parent: null,
          }),
      });

      this._frames$.next(nextFrames);
      removed.forEach((handle) => handle.dispose());
    });

    // const entityToolSubscription = combineLatest([
    //   this.toolManager.tool$,
    //   this.interactionManager.hovered$,
    // ]).subscribe(([tool, hovered]) => {
    //   if (tool instanceof EntityTool) {
    //     this.interactionManager.setDropCase({
    //       datatypes: [makeEntityDropType(tool.entityType)],
    //       target: hovered ?? this.fallback,
    //     });
    //   } else {
    //     this.interactionManager.clearDropCase();
    //   }
    // });

    // // handle layout update when viewport origin changes
    // const widgetHandlesSubscription =
    //   this.stager.viewport.initialContentOrigin$.subscribe(() => {
    //     this.handles.forEach((handle) =>
    //       handle.handleLayoutUpdate({
    //         propagation: new LayoutUpdatePropagation(),
    //       })
    //     );
    //   });

    // // center viewport on initial load
    // const fitInterfaceSubscription = this.stager.ready$.subscribe((ready) => {
    //   if (ready && !this.stager.viewport.initialized) {
    //     requestAnimationFrame(() => {
    //       requestAnimationFrame(() => {
    //         // wait until after the next paint to get the correct frame rect
    //         const f = this.frames[0];
    //         const i = () => ({
    //           scale: this.stager.viewport.scale,
    //           pan: this.stager.viewport.pan,
    //           windowRect: this.stager.viewport.windowRect(
    //             f.renderable.htmlElement(Renderable.defaultHtmlElementKey)!
    //           ).data,
    //           contentRect: f.contentRect.data,
    //         });
    //         fitIntoViewport(this);
    //         this.stager.viewport.initialize();
    //       });
    //     });
    //   }
    // });

    // const fallbackHandleSubscription = this.stager.component$.subscribe(
    //   (component) => {
    //     if (component) {
    //       this._fallbackHandle$.next(
    //         new FallbackHandle({ component, editor: this }),
    //       );
    //     } else {
    //       this._fallbackHandle$.next(undefined);
    //     }
    //   },
    // );

    // const handlesSubscription = this.handles$
    //   .pipe(
    //     debounceTime(0, asyncScheduler),
    //     map((handles) => handles.map((handle) => [handle.id, handle] as const)),
    //   )
    //   .subscribe((pairs) => {
    //     this._handleMap$.next(Object.fromEntries(pairs));
    //   });

    this.addDisposer(() => {
      // this._flags$.next({});
      // this._flags$.complete();
      framesSubscription.unsubscribe();
      // entityToolSubscription.unsubscribe();
      // widgetHandlesSubscription.unsubscribe();
      // fitInterfaceSubscription.unsubscribe();
      // widgetHandlesSubscription.unsubscribe();
      // handlesSubscription.unsubscribe();
      // fallbackHandleSubscription.unsubscribe();
      // this.widgetHandles.forEach((handle) => handle.dispose());
      // this.handles.forEach((handle) => handle.dispose());
      // this._widgets$.next([]);
      // this._widgetHandles$.next([]);
      // this._handles$.next([]);
      // this._handleMap$.next({});
      // this._fallbackHandle$.next(undefined);
      // this._widgets$.complete();
      // this._widgetHandles$.complete();
      // this._handles$.complete();
      // this._handleMap$.complete();
      // this.interactionManager.dispose();
      // this.toolManager.dispose();
      // this.markerManager.dispose();
      // this.contextManager.dispose();
      // this.commandManager.dispose();
      // this.keyboardManager.dispose();
    });
  }

  // refresh() {
  //   this.frames.forEach((frame) => {
  //     frame.handleLayoutUpdate({
  //       propagation: new LayoutUpdatePropagation(),
  //     });
  //   });
  // }

  registerHandle(handle: Handle): void {
    this._handles.set(handle.id, handle);
  }
  unregisterHandle(handle: Handle): void {
    this._handles.delete(handle.id);
  }

  // makeElementHandle = makeElementHandle;
  // makeInstanceHandle = makeInstanceHandle;
  // updateEntityHandleList = updateEntityHandleList;

  setFlag(key: string, value: boolean) {
    this._flags$.next({ ...this._flags$.value, [key]: value });
  }

  // registerEntityHandle(handle: IEntityHandle) {
  //   const handles = this._entityHandles.get(handle.entity) ?? [];
  //   this._entityHandles.set(handle.entity, [...handles, handle]);
  // }
  // unregisterEntityHandle(handle: IEntityHandle) {
  //   const handles = this._entityHandles.get(handle.entity) ?? [];
  //   this._entityHandles.set(
  //     handle.entity,
  //     handles.filter((h) => h !== handle)
  //   );
  // }
}
