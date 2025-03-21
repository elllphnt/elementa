import { Entity } from "@repo/elementa-models";
import { ElementaStager } from "@repo/elementa-stager";
import { Disposable } from "@repo/utils";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from "rxjs";
import { makeEntityDropType } from "./_lib/droptypes";
import {
  makeElementHandle,
  makeInstanceHandle,
  updateEntityHandleList,
} from "./_lib/handles";
import { IElementaInteractor, IEntityHandle, IHandle } from "./_types/_";
import { IHost } from "./_types/host";
import {
  FallbackHandle,
  FrameWidgetHandle,
  LayoutUpdatePropagation,
} from "./handles/_";
import { Interface } from "./interface";
import { CommandManager } from "./managers/command_manager";
import { InteractionManager } from "./managers/interaction";
import { KeyboardManager } from "./managers/keyboard";
import { MarkerManager } from "./managers/marker";
import { ToolManager } from "./managers/tool_manager";
import { EntityTool } from "./tools/entity";

export class ElementaInteractor
  extends Disposable
  implements IElementaInteractor
{
  readonly stager: ElementaStager;

  readonly interactionManager = new InteractionManager();
  readonly toolManager = new ToolManager();
  readonly markerManager = new MarkerManager();
  readonly commandManager: CommandManager = new CommandManager({
    interactor: this,
  });
  readonly keyboardManager: KeyboardManager = new KeyboardManager({
    interactor: this,
  });
  readonly interface: Interface = new Interface({ interactor: this });
  // readonly commandManager = new CommandManager({ elementa: this });
  // readonly keyboardManager = new KeyboardManager({ elementa: this });
  readonly fallback: FallbackHandle;
  readonly host: IHost;

  private _flags$ = new BehaviorSubject<Record<string, boolean>>({});

  // private _handleMap$ = new BehaviorSubject<Record<string, Handle>>({});

  private _frames$ = new BehaviorSubject<FrameWidgetHandle[]>([]);
  // private _widgetHandles$ = new BehaviorSubject<WidgetHandle[]>([]);
  // private _fallbackHandle$ = new BehaviorSubject<FallbackHandle | undefined>(
  //   undefined,
  // );

  // private _properties$ = new BehaviorSubject<Record<string, any>>({});
  private _handles = new Map<string, IHandle>();
  private _entityHandles = new Map<Entity, IEntityHandle[]>();

  get flags() {
    return this._flags$.value;
  }
  get flags$() {
    return this._flags$.asObservable();
  }

  flag(key: string) {
    return this._flags$.value[key] ?? false;
  }
  flag$(key: string) {
    return this._flags$.pipe(
      map((flags) => flags[key] ?? false),
      distinctUntilChanged(),
    );
  }

  // get handleMap() {
  //   return this._handleMap$.value;
  // }
  // get handleMap$() {
  //   return this._handleMap$.asObservable();
  // }

  // get handles() {
  //   return this._handles$.value;
  // }
  // get handles$() {
  //   return this._handles$.asObservable();
  // }

  // handle(handleId: string) {
  //   return this.handleMap[handleId] as Handle | undefined;
  // }
  // handle$(handleId: string) {
  //   return this.handleMap$.pipe(
  //     map((handles) => handles[handleId] as Handle | undefined),
  //   );
  // }

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

  get frames() {
    return this._frames$.value;
  }
  get frames$() {
    return this._frames$.asObservable();
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

  get handles() {
    return Array.from(this._handles.values());
  }
  entityHandles(entity: Entity): IEntityHandle[] {
    return this._entityHandles.get(entity) ?? [];
  }

  constructor({ stager, host }: { stager: ElementaStager; host: IHost }) {
    super();
    this.stager = stager;
    this.host = host;

    this.fallback = new FallbackHandle({ interactor: this, parent: null });

    const framesSubscription = this.stager.frames$.subscribe((frames) => {
      const newHandles = this.updateEntityHandleList({
        handles: this.frames,
        renderables: frames,
        interactor: this,
        parent: this.fallback,
      });

      this._frames$.next(newHandles);
    });

    const entityToolSubscription = combineLatest([
      this.toolManager.tool$,
      this.interactionManager.hovered$,
    ]).subscribe(([tool, hovered]) => {
      if (tool instanceof EntityTool) {
        this.interactionManager.setDropCase({
          datatypes: [makeEntityDropType(tool.entityType)],
          target: hovered ?? this.fallback,
        });
      } else {
        this.interactionManager.clearDropCase();
      }
    });

    // handle layout update when viewport origin changes
    const widgetHandlesSubscription =
      this.stager.viewport.initialContentOrigin$.subscribe(() => {
        this.handles.forEach((handle) =>
          handle.handleLayoutUpdate({
            propagation: new LayoutUpdatePropagation(),
          }),
        );
      });

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
      this._flags$.next({});
      this._flags$.complete();
      framesSubscription.unsubscribe();
      entityToolSubscription.unsubscribe();
      widgetHandlesSubscription.unsubscribe();
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
  registerHandle(handle: IHandle): void {
    this._handles.set(handle.id, handle);
  }
  unregisterHandle(handle: IHandle): void {
    this._handles.delete(handle.id);
  }

  makeElementHandle = makeElementHandle;
  makeInstanceHandle = makeInstanceHandle;
  updateEntityHandleList = updateEntityHandleList;

  setFlag(key: string, value: boolean) {
    console.log("setFlag", key, value);
    this._flags$.next({ ...this._flags$.value, [key]: value });
  }

  registerEntityHandle(handle: IEntityHandle) {
    const handles = this._entityHandles.get(handle.entity) ?? [];
    this._entityHandles.set(handle.entity, [...handles, handle]);
  }
  unregisterEntityHandle(handle: IEntityHandle) {
    const handles = this._entityHandles.get(handle.entity) ?? [];
    this._entityHandles.set(
      handle.entity,
      handles.filter((h) => h !== handle),
    );
  }
}
