import { EdgeName, entityTypeMatch } from "@elllphnt/elll-element";
import { Entity } from "@repo/elementa-models";
import { Renderable } from "@repo/elementa-renderer";
import { Disposable, Rect, combineLatestOrEmpty } from "@repo/utils";
import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import { isEntityDropType, parseEntityDropType } from "../_lib/droptypes";
import { DropOptions, IHandle } from "../_types/handles/handle";
import { ILayoutUpdatePropagation } from "../_types/handles/handle_rect";
import { IElementaInteractor } from "../_types/interactor";
import { ConnectionHandle } from "./connection";
import {
  HandleRect,
  interfaceRectOf,
  interfaceRectOf$,
  viewportRectOf,
  viewportRectOf$,
} from "./handle_rect";
import { HandleInteractionTarget } from "./target";

export type EventListenerData = {
  key: number;
  type: keyof HTMLElementEventMap;
  listener: (event: HTMLElementEventMap[keyof HTMLElementEventMap]) => void;
  options?: boolean | AddEventListenerOptions;
};

export abstract class Handle extends Disposable implements IHandle {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${Handle.keySeed}-${Handle.key++}`;

  readonly id: string;
  readonly type: string;
  readonly parent: IHandle | undefined;
  readonly interactor: IElementaInteractor;
  readonly allowedDropTypes: string[];

  private _partKey$ = new BehaviorSubject<string | undefined>(undefined);
  private _rects$ = new BehaviorSubject<Record<string, HandleRect>>({});
  private _rectHtmlElements$ = new BehaviorSubject<Record<string, HTMLElement>>(
    {},
  );
  private _targets$ = new BehaviorSubject<HandleInteractionTarget[]>([]);
  private _listeners$ = new BehaviorSubject<EventListenerData[]>([]);
  private _listenerCounter = 0;
  private _ownZIndex$ = new BehaviorSubject<number>(0);

  private _properties$ = new BehaviorSubject<Record<string, any>>({});

  get path(): string[] {
    return [...(this.parent?.path ?? []), this.key];
  }
  descendantOf(handle: IHandle): boolean {
    return this.path.includes(handle.key);
  }

  property<T>(name: string) {
    return this._properties$.value[name] as T | undefined;
  }
  property$<T>(name: string) {
    return this._properties$.asObservable().pipe(
      map((properties) => properties[name] as T | undefined),
      distinctUntilChanged(),
    );
  }

  get allowedPortPlacements(): EdgeName[] {
    return [];
  }
  get allowedPortPlacements$(): Observable<EdgeName[]> {
    return of([]);
  }

  get connections$(): Observable<ConnectionHandle[]> {
    return of([]);
  }
  get connections(): ConnectionHandle[] {
    return [];
  }

  get partKey() {
    return this._partKey$.value;
  }
  get partKey$() {
    return this._partKey$.asObservable();
  }

  get zIndex$(): Observable<number> {
    return combineLatestOrEmpty([
      this._ownZIndex$,
      this.parent?.zIndex$ ?? of(0),
    ]).pipe(map(([own, parent]) => own + parent));
  }
  get zIndex(): number {
    return (this.parent?.zIndex ?? 0) + this._ownZIndex$.value;
  }

  get rects$() {
    return this._rects$.asObservable();
  }
  get rects() {
    return this._rects$.value;
  }

  rectHtmlElement$(key: string): Observable<HTMLElement | undefined> {
    return this._rectHtmlElements$.pipe(
      map((elements) => elements[key]),
      distinctUntilChanged(),
    );
  }
  rectHtmlElement(key: string): HTMLElement | undefined {
    return this._rectHtmlElements$.value[key];
  }

  contentHtmlElement(key: string): HTMLElement | undefined {
    return undefined;
  }
  contentHtmlElement$(key: string): Observable<HTMLElement | undefined> {
    return of(undefined);
  }

  get listeners$() {
    return this._listeners$.asObservable();
  }
  get listeners() {
    return this._listeners$.value;
  }

  get contentRect$() {
    return this.rects$.pipe(
      switchMap((handles) =>
        combineLatestOrEmpty(
          Object.values(handles).map((handle) => handle.contentRect$),
        ),
      ),
      map((rects) =>
        Rect.union(Object.values(rects).filter(Boolean) as Rect[]),
      ),
    );
  }
  get contentRect() {
    return Rect.union(
      Object.values(this.rects)
        .map((handle) => handle.contentRect)
        .filter(Boolean) as Rect[],
    );
  }

  get viewportRect$() {
    return this.contentRect$.pipe(
      switchMap((contentRect) => {
        return contentRect
          ? viewportRectOf$(this.interactor.stager.viewport, contentRect)
          : of(undefined);
      }),
    );
  }
  get viewportRect() {
    return this.contentRect
      ? viewportRectOf(this.interactor.stager.viewport, this.contentRect)
      : undefined;
  }

  get interfaceRect$(): Observable<Rect | undefined> {
    return this.contentRect$.pipe(
      switchMap((contentRect) =>
        interfaceRectOf$(this.interactor.interface, contentRect),
      ),
    );
  }
  get interfaceRect(): Rect | undefined {
    return interfaceRectOf(this.interactor.interface, this.contentRect);
  }

  get hovered$(): Observable<boolean> {
    return this.interactor.interactionManager.hovered$.pipe(
      map((hovered) => hovered === this),
      distinctUntilChanged(),
    );
  }
  get hovered(): boolean {
    return this.interactor.interactionManager.hovered === this;
  }

  get selected$(): Observable<boolean> {
    return this.interactor.interactionManager.selection$.pipe(
      map((selection) => selection.includes(this)),
      distinctUntilChanged(),
    );
  }
  get selected(): boolean {
    return this.interactor.interactionManager.selection.includes(this);
  }

  get active$(): Observable<boolean> {
    return this.selected$;
  }
  get active(): boolean {
    return this.selected;
  }

  get hasSelection$() {
    return this.interactor.interactionManager.selection$.pipe(
      map((selection) => {
        return selection.some((handle) => {
          return handle.path.join(",").startsWith(this.path.join(",") + ",");
        });
      }),
      distinctUntilChanged(),
    );
  }
  get hasSelection() {
    return this.interactor.interactionManager.selection.some((handle) =>
      handle.path.join(",").startsWith(this.path.join(",") + ","),
    );
  }

  get isDropTarget$(): Observable<boolean> {
    return this.interactor.interactionManager.dropTarget$.pipe(
      map((target) => target === this),
      distinctUntilChanged(),
    );
  }
  get isDropTarget(): boolean {
    return this.interactor.interactionManager.dropTarget === this;
  }

  get focused$(): Observable<boolean> {
    return this.interactor.interactionManager.focused$.pipe(
      map((focus) => focus === this),
    );
  }
  get focused(): boolean {
    return this.interactor.interactionManager.focused === this;
  }

  get children$(): Observable<IHandle[]> {
    return of([]);
  }
  get children(): IHandle[] {
    return [];
  }

  constructor({
    id,
    type,
    interactor,
    parent,
    allowedDropTypes = [],
  }: {
    id: string;
    type: string;
    interactor: IElementaInteractor;
    parent: IHandle | null;
    allowedDropTypes?: string[];
  }) {
    super();
    this.interactor = interactor;
    this.id = id;
    this.type = type;
    this.allowedDropTypes = allowedDropTypes;
    this.parent = parent ?? undefined;

    this.addEventListener("mouseenter", () => {
      this.hover();
    });
    this.addEventListener("mouseleave", () => {
      this.unhover();
    });
    this.addEventListener("click", (event) => {
      const tool = this.interactor.toolManager.tool;
      const handled = tool.tap({
        interactor: this.interactor,
        target: this,
        position: {
          x: event.clientX,
          y: event.clientY,
        },
        keys: {
          shift: event.shiftKey,
          ctrl: event.ctrlKey,
          alt: event.altKey,
        },
      });
      if (!handled) {
        this.select({
          toggle: event.shiftKey,
        });
      } else {
        event.stopPropagation();
      }
    });
    this.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      const tool = this.interactor.toolManager.tool;
      tool.down({
        interactor: this.interactor,
        target: this,
        position: {
          x: event.clientX,
          y: event.clientY,
        },
        keys: {
          shift: event.shiftKey,
          ctrl: event.ctrlKey,
          alt: event.altKey,
        },
      });
    });
    this.addEventListener("dragover", (event) => {
      event.preventDefault();
      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) return;

      if (this.acceptDrop({ datatypes: [...(dataTransfer.types ?? [])] })) {
        event.dataTransfer.dropEffect = "copy";
        this.interactor.interactionManager.setDropCase({
          target: this,
          datatypes: [...(event.dataTransfer?.types ?? [])],
        });
      }
    });
    this.addEventListener("drop", (event) => {
      const stagerPosition = this.interactor.interface.interactorToStager({
        x: event.clientX,
        y: event.clientY,
      });
      const contentPosition =
        this.interactor.stager.viewport.windowToContent(stagerPosition);

      const target = this.resolveDropTarget({
        datatypes: [...(event.dataTransfer?.types ?? [])],
      });

      const data = Handle.dropDataFromDragEvent(event);
      if (target) {
        event.preventDefault();
        const handles = target.handleDrop(data, {
          position: contentPosition,
        });
        this.interactor.interactionManager.select(handles);
      }
    });

    // register handle
    this.interactor.registerHandle(this);

    this.addDisposer(() => {
      this._rects$.complete();

      for (const rectHandle of Object.values(this._rects$.value)) {
        rectHandle.dispose();
      }

      // unregister handle
      this.interactor.unregisterHandle(this);
    });
  }

  static dropDataFromDragEvent(event: DragEvent): Record<string, any> {
    const data: Record<string, any> = {};
    for (const type of event.dataTransfer?.types ?? []) {
      data[type] = event.dataTransfer?.getData(type);
    }
    if (event.dataTransfer?.files) {
      data.__files = event.dataTransfer.files;
    }
    return data;
  }

  setProperty(name: string, value: any) {
    this._properties$.next({
      ...this._properties$.value,
      [name]: value,
    });
  }

  select({ toggle }: { toggle?: boolean } = {}) {
    this.interactor.interactionManager.select([this], { toggle });
  }
  deselect() {
    this.interactor.interactionManager.deselect([this]);
  }
  hover() {
    this.interactor.interactionManager.hover(this);
  }
  unhover() {
    this.interactor.interactionManager.unhover(this);
  }
  focus() {
    this.interactor.interactionManager.focus(this);
  }
  blur() {
    this.interactor.interactionManager.blur(this);
  }

  addInteractionTarget(target: HTMLElement) {
    const interactionTarget = new HandleInteractionTarget({
      editor: this.interactor,
      handle: this,
    });
    interactionTarget.setHtmlElement(target);
    this._targets$.next([...this._targets$.value, interactionTarget]);
  }
  removeInteractionTarget(target: HTMLElement) {
    const toDispose: HandleInteractionTarget[] = [];

    this._targets$.next(
      this._targets$.value.filter((t) => {
        if (t.htmlElement === target) {
          toDispose.push(t);
          return false;
        } else {
          return true;
        }
      }),
    );

    for (const target of toDispose) {
      target.dispose();
    }
  }

  addEventListener<t extends keyof HTMLElementEventMap>(
    type: t,
    listener: (
      event: HTMLElementEventMap[t],
      options?: boolean | AddEventListenerOptions,
    ) => void,
  ) {
    const key = this._listenerCounter++;
    this._listeners$.next([
      ...this._listeners$.value,
      {
        key,
        type,
        listener: listener as any,
      },
    ]);

    return () => {
      this._listeners$.next(
        this._listeners$.value.filter(
          (l) => l.type !== type || l.listener !== listener,
        ),
      );
    };
  }

  handleLayoutUpdate({
    propagation,
  }: { propagation?: ILayoutUpdatePropagation } = {}) {
    if (propagation) {
      if (propagation.isConfimed(this)) {
        return;
      }
      propagation.confirm(this);
      if (this.parent) {
        this.parent.handleLayoutUpdate({ propagation });
      }
    }

    for (const rect of Object.values(this.rects)) {
      rect.handleLayoutUpdate();
    }
  }

  private _setRectHtmlElement(key: string, element: HTMLElement | undefined) {
    const nextRectHtmlElements = { ...this._rectHtmlElements$.value };
    if (element) {
      nextRectHtmlElements[key] = element;
    } else {
      delete nextRectHtmlElements[key];
    }
    this._rectHtmlElements$.next(nextRectHtmlElements);
  }
  setRectHtmlElement(element: HTMLElement | undefined | null): void;
  setRectHtmlElement(
    key: string,
    element: HTMLElement | undefined | null,
  ): void;
  setRectHtmlElement(
    ...args:
      | [HTMLElement | null | undefined]
      | [string, HTMLElement | null | undefined]
  ) {
    let key: string;
    let element: HTMLElement | undefined;

    if (args.length === 1) {
      key = Renderable.defaultHtmlElementKey;
      element = args[0] ?? undefined;
    } else {
      key = args[0];
      element = args[1] ?? undefined;
    }

    this._setRectHtmlElement(key, element);
  }

  protected setRects(rects: Record<string, HandleRect>) {
    this._rects$.next(rects);
  }

  // To be overridden
  handleEntityDrop(_: Entity[], __?: DropOptions): IHandle[] {
    console.warn(
      `Cannot handle entity drop in ${(this as any).__proto__.constructor.name}`,
    );
    return [];
  }
  handleDrop(data: Record<string, any>, options?: DropOptions): IHandle[] {
    let entityEntry = Object.entries(data).find(([key]) =>
      isEntityDropType(key),
    );
    if (entityEntry) {
      const entities = entityEntry[1] as Entity[];
      return this.handleEntityDrop(entities, options);
    } else {
      return this.interactor.host.handleDrop(this, data, options);
    }
  }

  entityHandle<T extends Entity>(entity: T): IHandle | undefined {
    const entityHandles = this.interactor.entityHandles(entity);
    return entityHandles.find((h) => h.descendantOf(this));
  }

  abstract delete(): void;

  acceptDrop({ datatypes }: { datatypes: string[] }): boolean {
    return (
      this.allowedDropTypes.some((allowedType) => {
        return datatypes.some((dropType) => {
          if (isEntityDropType(allowedType) && isEntityDropType(dropType)) {
            const allowedEntityType = parseEntityDropType(allowedType).entity;
            const entityDropType = parseEntityDropType(dropType).entity;

            return entityTypeMatch(entityDropType, allowedEntityType);
          } else {
            return allowedType === dropType;
          }
        });
      }) || this.interactor.host.acceptDrop(this, { datatypes })
    );
  }
  resolveDropTarget({
    datatypes,
  }: {
    datatypes: string[];
  }): IHandle | undefined {
    if (this.acceptDrop({ datatypes })) {
      return this;
    } else {
      return this.parent?.resolveDropTarget({ datatypes });
    }
  }
}
